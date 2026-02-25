import json
import time
import threading
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
from kafka import KafkaProducer, KafkaConsumer

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Start with a strong mix of 15. The UI can add up to 35 more (Max 50).
active_assets = {
    "AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL",
    "BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "SPY", "QQQ", "DIA", "V"
}

def fetch_price(symbol):
    try:
        # fast_info is incredibly fast and avoids downloading massive history files
        info = yf.Ticker(symbol).fast_info
        current_price = info.last_price
        prev_close = info.previous_close
        
        # Protect against missing data
        if current_price is None or prev_close is None: return None
        
        change_pct = ((current_price - prev_close) / prev_close) * 100
        
        return {
            "symbol": symbol.replace("-USD", ""), # Clean up crypto names for the UI
            "price": current_price,
            "change": round(change_pct, 2)
        }
    except Exception:
        return None

# 🔴 BACKGROUND THREAD: Listens for commands from the React UI
def listen_for_ui_commands():
    consumer = KafkaConsumer(
        'new-assets', 
        bootstrap_servers=['localhost:9092'], 
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    for msg in consumer:
        sym = msg.value.get('symbol', '').upper()
        # Auto-format crypto for yfinance
        if sym in ["BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "SHIB"]: sym += "-USD"
        
        if sym and len(active_assets) < 50:
            active_assets.add(sym)
            print(f"➕ Added {sym.replace('-USD', '')} to Watchlist! (Capacity: {len(active_assets)}/50)")

# Start the listener in the background
threading.Thread(target=listen_for_ui_commands, daemon=True).start()

print("🚀 Unified Market Engine Online! Tracking Stocks & Crypto...")

# 🔴 MAIN LOOP: Fetches all prices concurrently every 2 seconds
while True:
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_price, active_assets))
    
    for res in results:
        if res: producer.send('market-ticks', res)
        
    time.sleep(2) # 2-second heartbeat