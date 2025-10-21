from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.routers.user import get_current_user
from app.models.claim_model import (
    Claim, ClaimCreate, ClaimUpdate, ClaimStatusUpdate, 
    ClaimListResponse, ClaimHistory, ClaimStatus
)
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

def generate_claim_number() -> str:
    """Generate a unique claim number"""
    return f"CLM-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/", response_model=Claim)
async def create_claim(
    claim_data: ClaimCreate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new claim"""
    try:
        claim_id = str(uuid.uuid4())
        claim_number = generate_claim_number()
        
        # Prepare claim data
        new_claim = {
            "id": claim_id,
            "user_id": current_user.id,
            "claim_number": claim_number,
            "type": claim_data.type.value,
            "status": ClaimStatus.submitted.value,
            "priority": claim_data.priority.value,
            "amount": claim_data.amount,
            "description": claim_data.description,
            "incident_date": claim_data.incident_date.isoformat(),
            "submitted_date": datetime.now().isoformat(),
            "metadata": claim_data.metadata or {},
            "ai_analysis": {}
        }
        
        response = supabase.table('claims').insert(new_claim).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create claim"
            )
        
        # Add to claim history
        history_entry = {
            "id": str(uuid.uuid4()),
            "claim_id": claim_id,
            "action": "Claim submitted",
            "new_status": ClaimStatus.submitted.value,
            "performed_by": current_user.id,
            "performed_at": datetime.now().isoformat()
        }
        
        supabase.table('claim_history').insert(history_entry).execute()
        
        return Claim(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create claim: {str(e)}"
        )

@router.get("/", response_model=ClaimListResponse)
async def get_claims(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[ClaimStatus] = Query(None),
    type: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get user's claims with pagination and filtering"""
    try:
        # Build query
        query = supabase.table('claims').select('*', count='exact').eq('user_id', current_user.id)
        
        # Apply filters
        if status:
            query = query.eq('status', status.value)
        if type:
            query = query.eq('type', type)
        
        # Apply pagination
        offset = (page - 1) * per_page
        query = query.range(offset, offset + per_page - 1).order('created_at', desc=True)
        
        response = query.execute()
        
        claims = [Claim(**claim) for claim in response.data]
        total = response.count if response.count is not None else len(claims)
        total_pages = (total + per_page - 1) // per_page
        
        return ClaimListResponse(
            claims=claims,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve claims: {str(e)}"
        )

@router.get("/{claim_id}", response_model=Claim)
async def get_claim(
    claim_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific claim"""
    try:
        response = supabase.table('claims').select('*').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        return Claim(**response.data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve claim: {str(e)}"
        )

@router.put("/{claim_id}", response_model=Claim)
async def update_claim(
    claim_id: str,
    claim_update: ClaimUpdate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Update a claim (only if in submitted status)"""
    try:
        # Check if claim exists and belongs to user
        existing_claim = supabase.table('claims').select('*').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not existing_claim.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        # Only allow updates if claim is in submitted status
        if existing_claim.data['status'] != ClaimStatus.submitted.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update claim that is being processed"
            )
        
        # Prepare update data
        update_data = {k: v for k, v in claim_update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Convert enums to values
        if 'type' in update_data:
            update_data['type'] = update_data['type'].value
        if 'priority' in update_data:
            update_data['priority'] = update_data['priority'].value
        if 'status' in update_data:
            update_data['status'] = update_data['status'].value
        if 'incident_date' in update_data:
            update_data['incident_date'] = update_data['incident_date'].isoformat()
        
        update_data['updated_at'] = datetime.now().isoformat()
        
        response = supabase.table('claims').update(update_data).eq('id', claim_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update claim"
            )
        
        return Claim(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update claim: {str(e)}"
        )

@router.get("/{claim_id}/history", response_model=List[ClaimHistory])
async def get_claim_history(
    claim_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get claim history"""
    try:
        # Verify claim belongs to user
        claim_response = supabase.table('claims').select('id').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not claim_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        # Get claim history
        history_response = supabase.table('claim_history').select('*').eq('claim_id', claim_id).order('performed_at', desc=True).execute()
        
        return [ClaimHistory(**entry) for entry in history_response.data]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve claim history: {str(e)}"
        )