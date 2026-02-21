"""A2A Inspector Service Layer"""

import logging
from typing import Any, Dict, List, Optional
import httpx
from urllib.parse import urlparse
from uuid import uuid4

# New a2a SDK imports (v0.44+)
try:
    # Try new API first (a2a >= 0.44)
    from a2a.client import ClientFactory, ClientConfig, create_text_message_object
    from a2a.types import TaskState, AgentCard
    USE_NEW_API = True
except ImportError:
    # Fallback to old API
    from a2a.client.client import A2ACardResolver, A2AClient
    from a2a.types import Message, MessageSendParams, MessageSendConfiguration, SendStreamingMessageRequest, SendMessageRequest, Role, TextPart, AgentCard, SendMessageResponse, SendStreamingMessageResponse, JSONRPCErrorResponse
    USE_NEW_API = False

logger = logging.getLogger(__name__)

class A2AInspectorService:
    """A2A Agent Inspector Service"""
    
    def __init__(self):
        # timeout for http requests
        self.timeout = 60.0
    
    async def load_agent_card(self, agent_url: str) -> Dict[str, Any]:
        """Load Agent card information"""
        if not agent_url:
            return {
                "success": False,
                "error": "Agent URL is required"
            }
        
        try:
            if USE_NEW_API:
                # New API: Use ClientFactory to connect and get agent card
                config = ClientConfig(streaming=False)
                client = await ClientFactory.connect(agent_url, client_config=config)
                card = await client.get_card()
                card_data = card.model_dump(exclude_none=False)
                await client.close()
            else:
                # Old API: Use A2ACardResolver
                async with httpx.AsyncClient(timeout=self.timeout) as http_client:
                    card_resolver = A2ACardResolver(http_client, agent_url)
                    card = await card_resolver.get_agent_card()
                card_data = card.model_dump(exclude_none=False)

            return {
                "success": True,
                "data": card_data,
                "message": "Agent card loaded successfully"
            }
        except Exception as e:
            logger.error(f'Failed to load agent card from {agent_url}: {e}')
            return {
                "success": False,
                "error": str(e)
            }
    
    async def inspect_agent_card(self, agent_url: str) -> Dict[str, Any]:
        """Inspect Agent card"""
        result = await self.load_agent_card(agent_url)
        if result["success"]:
            return self._validate_agent_card(result["data"])
        else:
            return result
        
    def _validate_agent_card(self, card_data: Dict[str, Any]) -> List[str]:
        """Validate Agent card"""
        validation_results = []
        
        # Check required fields
        required_fields = ['name', 'version', 'capabilities', 'url']
        for field in required_fields:
            if field not in card_data or not card_data[field]:
                validation_results.append(f"✗ Missing required field: {field}")
            else:
                validation_results.append(f"✓ Required field '{field}' is present")
        
        # Check capabilities
        if 'capabilities' in card_data:
            capabilities = card_data['capabilities']
            if isinstance(capabilities, dict):
                validation_results.append("✓ Capabilities structure is valid")
                
                # Check A2A key capabilities
                if capabilities.get('streaming'):
                    validation_results.append("✓ Streaming capability supported")
                else:
                    validation_results.append("⚠ Streaming capability not supported")
                
                if capabilities.get('pushNotifications'):
                    validation_results.append("✓ Push notifications supported")
                else:
                    validation_results.append("⚠ Push notifications not supported")
            else:
                validation_results.append("✗ Capabilities must be an object")
        
        # Check skills
        if 'skills' in card_data:
            skills = card_data['skills']
            if isinstance(skills, list):
                if skills:
                    validation_results.append(f"✓ Agent has {len(skills)} skills defined")
                else:
                    validation_results.append("⚠ No skills defined")
            else:
                validation_results.append("✗ Skills must be an array")
        
        validation_results.append("✓ Agent card validation completed")
        return validation_results
    
    # for inspection center
    async def send_message(self, agent_url: str, message_text: str) -> Dict[str, Any]:
        try:
            if USE_NEW_API:
                # New API: Use ClientFactory
                config = ClientConfig(streaming=True)
                client = await ClientFactory.connect(agent_url, client_config=config)
                
                message = create_text_message_object(content=str(message_text))
                
                response_data = None
                async for event in client.send_message(message):
                    if isinstance(event, tuple):
                        task, update = event
                        logger.info(f"Task {task.id}: {task.status.state}")
                        
                        if task.status.state == TaskState.completed:
                            if task.status.message:
                                response_data = task.model_dump(exclude_none=True)
                    else:
                        # Direct message response
                        response_data = event.model_dump(exclude_none=True) if hasattr(event, 'model_dump') else {"response": str(event)}
                
                await client.close()
                
                if response_data:
                    return {
                        "success": True,
                        "data": response_data,
                        "message": "Message sent successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": "No response received"
                    }
            else:
                # Old API: Use A2ACardResolver and A2AClient
                httpx_client = httpx.AsyncClient(timeout=self.timeout)
                card_resolver = A2ACardResolver(httpx_client, str(agent_url))
                card = await card_resolver.get_agent_card()
                a2a_client = A2AClient(httpx_client, agent_card=card)

                message = Message(
                    role=Role.user,
                    parts=[TextPart(text=str(message_text))],
                    messageId=str(uuid4()),
                    contextId=str(uuid4()),
                )

                payload = MessageSendParams(
                    message=message,
                    configuration=MessageSendConfiguration(),
                )
                    
                supports_streaming = (
                    hasattr(card.capabilities, 'streaming')
                    and card.capabilities.streaming is True
                )
                if supports_streaming:
                    stream_request = SendStreamingMessageRequest(
                        id=str(uuid4()),
                        method='message/stream',
                        jsonrpc='2.0',
                        params=payload
                    )
                    response_stream = a2a_client.send_message_streaming(stream_request)
                    response = None
                    async for stream_result in response_stream:
                        response = await self.validate_a2a_response_old(stream_result)
                    
                    logger.info(f"validate_a2a_response: response: {response}")
                    return response
                else:
                    send_message_request = SendMessageRequest(
                        id=str(uuid4()),
                        method='message/send',
                        jsonrpc='2.0',
                        params=payload,
                    )
                    send_result = await a2a_client.send_message(send_message_request)
                    return await self.validate_a2a_response_old(send_result)

        except Exception as e:
            logger.error(f'Failed to send message: {e}')
            return {
                "success": False,
                "error": str(e)
            }
        
    async def validate_a2a_response_old(self, result) -> Dict[str, Any]:
        """Validate a response from the old A2A client API."""
        if hasattr(result, 'root') and hasattr(result.root, 'error'):
            error_data = result.root.error.model_dump(exclude_none=True)
            return {
                "success": False,
                "error": str(error_data)
            }

        response_data = result.root.result if hasattr(result, 'root') else result
        logger.info(f"validate_a2a_response: response_data: {response_data}")

        if hasattr(response_data, 'model_dump'):
            response_data = response_data.model_dump(exclude_none=True)

        return {
            "success": True,
            "data": response_data,
            "message": "Message sent successfully"
        }



# Global service instance
inspector_service = A2AInspectorService() 