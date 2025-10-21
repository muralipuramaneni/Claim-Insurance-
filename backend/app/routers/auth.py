from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_supabase
from app.models.user_model import UserRegister, UserLogin, UserResponse, ProfileCreate
import uuid

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(
    user_data: UserRegister,
    supabase: Client = Depends(get_supabase)
):
    """Register a new user"""
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )
        
        user_id = auth_response.user.id
        
        # Create profile
        profile_data = ProfileCreate(
            id=user_id,
            full_name=user_data.full_name,
            role=user_data.role
        )
        
        profile_response = supabase.table('profiles').insert({
            "id": profile_data.id,
            "full_name": profile_data.full_name,
            "role": profile_data.role.value
        }).execute()
        
        if not profile_response.data:
            # Cleanup: delete user if profile creation fails
            supabase.auth.admin.delete_user(user_id)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user profile"
            )
        
        return {
            "message": "User registered successfully",
            "user_id": user_id,
            "email": user_data.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=dict)
async def login(
    credentials: UserLogin,
    supabase: Client = Depends(get_supabase)
):
    """Login user"""
    try:
        # Note: In a real application, you would use the client-side auth
        # This is a simplified version for demonstration
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        return {
            "message": "Login successful",
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.post("/logout")
async def logout(supabase: Client = Depends(get_supabase)):
    """Logout user"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_token: str,
    supabase: Client = Depends(get_supabase)
):
    """Refresh access token"""
    try:
        auth_response = supabase.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )