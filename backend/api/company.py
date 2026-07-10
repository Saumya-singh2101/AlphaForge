from fastapi import APIRouter

from services.company_service import get_company_details
from models.company import CompanyResponse

router = APIRouter()

@router.get("/company/{ticker}", response_model=CompanyResponse)
def get_company(ticker: str):
    return get_company_details(ticker)