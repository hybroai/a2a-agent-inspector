"""A2A Inspector Service Layer"""

import logging
from typing import Any, Dict, List, Optional
import httpx
from urllib.parse import urlparse
from a2a.client.client import A2ACardResolver
from a2a.client.client import A2AClient
from a2a.types import Message, MessageSendParams, MessageSendConfiguration, SendStreamingMessageRequest, SendMessageRequest, Role, TextPart, AgentCard, SendMessageResponse, SendStreamingMessageResponse, JSONRPCErrorResponse
from uuid import uuid4

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
            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:
                card_resolver = A2ACardResolver(client, agent_url)
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
                    response = await self.validate_a2a_response(stream_result)
                
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
                return await self.validate_a2a_response(send_result)

        except Exception as e:
            logger.error(f'Failed to send message: {e}')
            return {
                "success": False,
                "error": str(e)
            }
        
    async def validate_a2a_response(
        self,
        result: SendMessageResponse | SendStreamingMessageResponse
    ) -> Dict[str, Any]:
        """Validate a response from the A2A client."""
        if isinstance(result.root, JSONRPCErrorResponse):
            error_data = result.root.error.model_dump(exclude_none=True)

            return {
                "success": False,
                "error": str(error_data)
            }

        response_data = result.root.result

        logger.info(f"validate_a2a_response: response_data: {response_data}")

        response_data = response_data.model_dump(exclude_none=True)

        return {
            "success": True,
            "data": response_data,
            "message": "Message sent successfully"
        }



# Global service instance
inspector_service = A2AInspectorService() 