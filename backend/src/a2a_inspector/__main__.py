"""
A2A Inspector main module entry point.
This allows the package to be run directly with: uv run .
"""

import sys
import uvicorn


def main():
    """Main entry point"""
    uvicorn.run(
        "a2a_inspector.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )

def dev():
    """Development mode entry point"""
    uvicorn.run(
        "a2a_inspector.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "dev":
        dev()
    else:
        main()