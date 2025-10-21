from fastapi import APIRouter, Depends, HTTPException, status, Header
from supabase import Client
from app.database import get_supabase
from app.models.user_model import Profile, ProfileUpdate
from typing import Optional

router = APIRouter()

async def get_current_user(
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase)
):
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.get("/profile", response_model=Profile)
async def get_profile(
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get current user's profile"""
    try:
        response = supabase.table('profiles').select('*').eq('id', current_user.id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return Profile(**response.data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )

@router.put("/profile", response_model=Profile)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Update current user's profile"""
    try:
        # Prepare update data (only include non-None values)
        update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Add updated timestamp
        update_data['updated_at'] = 'now()'
        
        response = supabase.table('profiles').update(update_data).eq('id', current_user.id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return Profile(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.delete("/account")
async def delete_account(
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Delete current user's account"""
    try:
        # Delete profile first (due to foreign key constraints)
        supabase.table('profiles').delete().eq('id', current_user.id).execute()
        
        # Delete user from auth
        supabase.auth.admin.delete_user(current_user.id)
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )