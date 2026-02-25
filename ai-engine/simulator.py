import json
import time
import random
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 1. THE "MARKET MOVERS" (The Core Essentials)
market_movers = [
    'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META',  # Big Tech
    'BTC', 'ETH', 'SOL', 'XRP', 'DOGE',                      # Crypto
    'GOLD', 'SILVER', 'CRUDE_OIL', 'NAT_GAS',                # Commodities
    'RELIANCE', 'TCS', 'HDFC', 'INFY',                       # Indian Bluechips
    'EUR/USD', 'GBP/USD', 'JPY/USD',                         # Forex
    'SPY', 'QQQ', 'VIX'                                      # Indices/Volatility
]

# 2. FEATURE: CUSTOM ASSET INJECTION
# You can add any custom ticker here (e.g., a startup or a niche altcoin)
custom_assets = ['WAAVY', 'POKEFAM', 'INVESTSAFE_COIN'] 
all_symbols = market_movers + custom_assets

prices = {s: random.uniform(10, 3000) for s in all_symbols}

print(f"🚀 InvestSafe Simulator: Monitoring {len(all_symbols)} Assets")

try:
    while True:
        for s in all_symbols:
            # Volatility logic: Indices are stable, Crypto is wild
            vol = 0.005 if s in ['BTC', 'ETH', 'SOL'] else 0.001
            change = prices[s] * random.uniform(-vol, vol)
            prices[s] += change
            
            data = {"symbol": s, "price": round(prices[s], 2), "change": round(change, 2)}
            producer.send('market-ticks', data)
            
        time.sleep(1) # Broadcast every second
except KeyboardInterrupt:
    print("🛑 Simulator Offline")