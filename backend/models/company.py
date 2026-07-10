from pydantic import BaseModel
from typing import Optional


class CompanyResponse(BaseModel):
    ticker:           str
    company_name:     str
    exchange:         str
    sector:           str
    industry:         str         = "Unknown"
    country:          str         = "Unknown"
    currency:         str         = "USD"
    currency_symbol:  str         = "$"
    current_price:    float       = 0.0
    previous_close:   float       = 0.0
    change:           float       = 0.0
    change_percent:   float       = 0.0
    market_cap:       int         = 0
    pe_ratio:         Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low:  Optional[float] = None
    description:      str         = ""
    employees:        Optional[int]   = None
    website:          str         = ""
    analyst_target:   Optional[float] = None
    recommendation:   str         = ""
