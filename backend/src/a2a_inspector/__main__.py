"""
A2A Inspector main module entry point.
This allows the package to be run directly with: uv run .
"""

import uvicorn
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point"""
    logger.info("Starting A2A Inspector...")
    uvicorn.run(
        "a2a_inspector.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

def dev():
    """Development mode entry point"""
    logger.info("Starting A2A Inspector in development mode...")
    uvicorn.run(
        "a2a_inspector.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "dev":
        dev()
    else:
        main()