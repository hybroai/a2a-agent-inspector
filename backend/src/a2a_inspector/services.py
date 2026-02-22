"""A2A Inspector Service Layer"""

import logging
from typing import Any, Dict
import httpx
from uuid import uuid4

from a2a.client import A2ACardResolver, A2AClient
from a2a.types import (
    MessageSendParams,
    SendMessageRequest,
    SendStreamingMessageRequest,
)

logger = logging.getLogger(__name__)


class A2AInspectorService:
    """A2A Agent Inspector Service"""

    def __init__(self):
        # timeout for http requests
        self.timeout = 180.0

    async def load_agent_card(self, agent_url: str) -> Dict[str, Any]:
        """Load Agent card information"""
        if not agent_url:
            return {
                "success": False,
                "error": "Agent URL is required"
            }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as httpx_client:
                resolver = A2ACardResolver(
                    httpx_client=httpx_client,
                    base_url=agent_url,
                )
                card = await resolver.get_agent_card()
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

    def _validate_agent_card(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
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
        return {
            "success": True,
            "data": card_data,
            "validation": validation_results,
            "message": "Agent card validated successfully"
        }

    async def send_message(self, agent_url: str, message_text: str) -> Dict[str, Any]:
        """Send a message to an A2A agent"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as httpx_client:
                # Get agent card using resolver
                resolver = A2ACardResolver(
                    httpx_client=httpx_client,
                    base_url=agent_url,
                )
                card = await resolver.get_agent_card()
                
                # Create client with the card
                client = A2AClient(httpx_client=httpx_client, agent_card=card)

                # Build message payload
                send_message_payload: Dict[str, Any] = {
                    'message': {
                        'role': 'user',
                        'parts': [{'kind': 'text', 'text': str(message_text)}],
                        'message_id': uuid4().hex,
                    },
                }

                # Check if agent supports streaming
                supports_streaming = (
                    hasattr(card, 'capabilities')
                    and card.capabilities is not None
                    and getattr(card.capabilities, 'streaming', False)
                )

                if supports_streaming:
                    # Use streaming endpoint
                    streaming_request = SendStreamingMessageRequest(
                        id=str(uuid4()),
                        params=MessageSendParams(**send_message_payload)
                    )
                    stream_response = client.send_message_streaming(streaming_request)

                    response_data = None
                    async for chunk in stream_response:
                        response_data = chunk.model_dump(mode='json', exclude_none=True)

                    if response_data:
                        return {
                            "success": True,
                            "data": response_data,
                            "message": "Message sent successfully (streaming)"
                        }
                    else:
                        return {
                            "success": False,
                            "error": "No response received from streaming"
                        }
                else:
                    # Use non-streaming endpoint
                    request = SendMessageRequest(
                        id=str(uuid4()),
                        params=MessageSendParams(**send_message_payload)
                    )
                    response = await client.send_message(request)
                    response_data = response.model_dump(mode='json', exclude_none=True)

                    return {
                        "success": True,
                        "data": response_data,
                        "message": "Message sent successfully"
                    }
        except Exception as e:
            logger.error(f'Failed to send message: {e}')
            return {
                "success": False,
                "error": str(e)
            }


# Global service instance
inspector_service = A2AInspectorService()
