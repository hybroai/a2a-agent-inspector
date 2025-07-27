"""A2A Inspector FastAPI Application"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

from .services import inspector_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup event
    logger.info("A2A Inspector starting up...")
    yield
    
    # Shutdown event
    logger.info("A2A Inspector shutting down...")

# Create FastAPI application - using new lifespan parameter
app = FastAPI(
    title="A2A Agent Inspector",
    description="Agent-to-Agent Communication Compliance Validation Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "A2A Agent Inspector",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "load_agent": "POST /api/v1/inspector/load",
            "insepect_agent": "POST /api/v1/inspector/inspect",
            "send_message": "POST /api/v1/inspector/send-message"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "A2A Agent Inspector",
        "version": "1.0.0"
    }

# Main API endpoints
@app.post("/api/v1/inspector/load")
async def load_agent(request: Request):
    """Load and validate Agent"""
    try:
        request_data = await request.json()
        agent_url = request_data.get('url')

        if not agent_url:
            raise HTTPException(status_code=400, detail="url is required")
        
        logger.info(f"Loading agent from URL: {agent_url}")
        result = await inspector_service.load_agent_card(agent_url)
        
        if result["success"]:
            logger.info(f"Agent loaded successfully: {agent_url}")
        else:
            logger.warning(f"Failed to load agent: {agent_url} - {result['error']}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading agent: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/v1/inspector/inspect")
async def inspect_agent(request: Request):
    try:
        request_data = await request.json()
        agent_url = request_data.get('url')
        
        if not agent_url:
            raise HTTPException(status_code=400, detail="url is required")
        
        logger.info(f"Inspecting agent: {agent_url}")
        result = await inspector_service.inspect_agent_card(agent_url)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inspecting agent: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/v1/inspector/sendMessage")
async def send_message(request: Request):
    try:
        request_data = await request.json()
        agent_url = request_data.get('url')
        message_text = request_data.get('message')

        if not agent_url or not message_text:
            raise HTTPException(status_code=400, detail="url and message are required")
        
        logger.info(f"Sending message to agent: {agent_url}")
        result = await inspector_service.send_message(agent_url, message_text)

        return result
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        return {
            "success": False,
            "error": str(e)
        }






