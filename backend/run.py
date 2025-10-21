"""
Entry point for the Insurance Claim System backend
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Add the current directory to Python path
    import sys
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )