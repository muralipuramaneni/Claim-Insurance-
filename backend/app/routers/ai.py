from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_supabase
from app.routers.user import get_current_user
from app.langgraph.claim_agent import ClaimProcessingAgent
from pydantic import BaseModel
from typing import Dict, Any
import uuid

router = APIRouter()

class AIProcessRequest(BaseModel):
    claim_id: str

class AIAnalysisResponse(BaseModel):
    claim_id: str
    analysis: Dict[str, Any]
    confidence: float
    recommendations: list

class DocumentClassificationRequest(BaseModel):
    document_content: str
    document_type: str

class DocumentClassificationResponse(BaseModel):
    classification: str
    confidence: float
    extracted_data: Dict[str, Any]

class FraudCheckResponse(BaseModel):
    claim_id: str
    fraud_probability: float
    risk_factors: list
    recommendation: str

@router.post("/process-claim/{claim_id}", response_model=AIAnalysisResponse)
async def process_claim_with_ai(
    claim_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Process a claim using AI workflows"""
    try:
        # Verify claim belongs to user
        claim_response = supabase.table('claims').select('*').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not claim_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        claim_data = claim_response.data
        
        # Initialize AI agent
        agent = ClaimProcessingAgent()
        
        # Process claim through AI workflow
        ai_result = await agent.process_claim(claim_data)
        
        # Update claim with AI analysis
        update_data = {
            "ai_analysis": ai_result,
            "updated_at": "now()"
        }
        
        supabase.table('claims').update(update_data).eq('id', claim_id).execute()
        
        # Log AI processing
        log_entry = {
            "id": str(uuid.uuid4()),
            "claim_id": claim_id,
            "workflow_name": "claim_processing",
            "node_name": "full_analysis",
            "input_data": claim_data,
            "output_data": ai_result,
            "status": "success",
            "processed_at": "now()"
        }
        
        supabase.table('ai_processing_logs').insert(log_entry).execute()
        
        return AIAnalysisResponse(
            claim_id=claim_id,
            analysis=ai_result.get('analysis', {}),
            confidence=ai_result.get('confidence', 0.0),
            recommendations=ai_result.get('recommendations', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # Log error
        error_log = {
            "id": str(uuid.uuid4()),
            "claim_id": claim_id,
            "workflow_name": "claim_processing",
            "node_name": "full_analysis",
            "status": "error",
            "error_message": str(e),
            "processed_at": "now()"
        }
        
        supabase.table('ai_processing_logs').insert(error_log).execute()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing failed: {str(e)}"
        )

@router.get("/analysis/{claim_id}", response_model=AIAnalysisResponse)
async def get_ai_analysis(
    claim_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get existing AI analysis for a claim"""
    try:
        # Verify claim belongs to user and get AI analysis
        response = supabase.table('claims').select('id, ai_analysis').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        ai_analysis = response.data.get('ai_analysis', {})
        
        if not ai_analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No AI analysis found for this claim"
            )
        
        return AIAnalysisResponse(
            claim_id=claim_id,
            analysis=ai_analysis.get('analysis', {}),
            confidence=ai_analysis.get('confidence', 0.0),
            recommendations=ai_analysis.get('recommendations', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve AI analysis: {str(e)}"
        )

@router.post("/classify-document", response_model=DocumentClassificationResponse)
async def classify_document(
    request: DocumentClassificationRequest,
    current_user=Depends(get_current_user)
):
    """Classify and extract data from a document"""
    try:
        # Initialize AI agent
        agent = ClaimProcessingAgent()
        
        # Classify document
        classification_result = await agent.classify_document(
            request.document_content,
            request.document_type
        )
        
        return DocumentClassificationResponse(
            classification=classification_result.get('classification', 'unknown'),
            confidence=classification_result.get('confidence', 0.0),
            extracted_data=classification_result.get('extracted_data', {})
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document classification failed: {str(e)}"
        )

@router.get("/fraud-check/{claim_id}", response_model=FraudCheckResponse)
async def fraud_check(
    claim_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Run fraud detection on a claim"""
    try:
        # Verify claim belongs to user
        claim_response = supabase.table('claims').select('*').eq('id', claim_id).eq('user_id', current_user.id).single().execute()
        
        if not claim_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found"
            )
        
        claim_data = claim_response.data
        
        # Initialize AI agent
        agent = ClaimProcessingAgent()
        
        # Run fraud detection
        fraud_result = await agent.detect_fraud(claim_data)
        
        return FraudCheckResponse(
            claim_id=claim_id,
            fraud_probability=fraud_result.get('fraud_probability', 0.0),
            risk_factors=fraud_result.get('risk_factors', []),
            recommendation=fraud_result.get('recommendation', 'approve')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fraud detection failed: {str(e)}"
        )