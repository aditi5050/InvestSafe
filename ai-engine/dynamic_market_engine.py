import json
import requests
import websocket
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

print("🔍 Scanning global markets for Top 15 Trending Assets...")

# Fetch 24hr ticker data from Binance REST API
res = requests.get("https://api.binance.com/api/v3/ticker/24hr")
data = res.json()

# Filter for USDT pairs and sort by trading volume (Highest first)
usdt_pairs = [d for d in data if d['symbol'].endswith('USDT')]
usdt_pairs.sort(key=lambda x: float(x['quoteVolume']), reverse=True)
top_15 = usdt_pairs[:15]

# Dynamically map the symbols (e.g., 'BTCUSDT' -> 'BTC')
DYNAMIC_SYMBOL_MAP = {pair['symbol']: pair['symbol'].replace('USDT', '') for pair in top_15}
print(f"🔥 Trending Assets Locked: {', '.join(DYNAMIC_SYMBOL_MAP.values())}")

def on_message(ws, message):
    ticks = json.loads(message)
    for tick in ticks:
        symbol = tick['s']
        # Only stream data for our dynamically selected top 15
        if symbol in DYNAMIC_SYMBOL_MAP:
            formatted_tick = {
                "symbol": DYNAMIC_SYMBOL_MAP[symbol],
                "price": float(tick['c']),
                "change": float(tick['P'])
            }
            producer.send('market-ticks', formatted_tick)

def on_error(ws, error): print(f"❌ Error: {error}")
def on_close(ws, close_status_code, close_msg): print("🛑 Stream Closed")
def on_open(ws): print("🟢 Connected to Live Stream. Pumping to UI...")

if __name__ == "__main__":
    ws_url = "wss://stream.binance.com:9443/ws/!ticker@arr"
    ws = websocket.WebSocketApp(ws_url, on_open=on_open, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.run_forever()