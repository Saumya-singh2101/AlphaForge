import yfinance as yf

def get_stock_data(symbol: str):
    stock = yf.Ticker(symbol)

    return {
        "info": stock.info,
        "financials": stock.financials.to_dict(),
        "balance_sheet": stock.balance_sheet.to_dict(),
        "cashflow": stock.cashflow.to_dict()
    }