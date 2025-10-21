# Router initialization
from .auth import router as auth_router
from .user import router as user_router  
from .claims import router as claims_router
from .ai import router as ai_router

__all__ = ["auth_router", "user_router", "claims_router", "ai_router"]