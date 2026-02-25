import json
import websocket
from kafka import KafkaProducer

# 1. Connect to your local Kafka broker
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 2. Map the live Binance ticker symbols to our UI symbols
SYMBOL_MAP = {
    'BTCUSDT': 'BTC',
    'ETHUSDT': 'ETH',
    'SOLUSDT': 'SOL',
    'XRPUSDT': 'XRP',
    'DOGEUSDT': 'DOGE'
}

def on_message(ws, message):
    data = json.loads(message)
    
    # Binance sends an array of all market tickers every second
    for tick in data:
        symbol = tick['s']
        
        # Only process the coins we care about
        if symbol in SYMBOL_MAP:
            formatted_tick = {
                "symbol": SYMBOL_MAP[symbol],
                "price": float(tick['c']),  # 'c' is the current closing price
                "change": float(tick['P'])  # 'P' is the 24hr price change percentage
            }
            
            # Fire it to Kafka instantly
            producer.send('market-ticks', formatted_tick)
            print(f"📡 LIVE Ticker: {formatted_tick['symbol']} @ ${formatted_tick['price']} | Change: {formatted_tick['change']}%")

def on_error(ws, error):
    print(f"❌ WebSocket Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("🛑 Live Binance Stream Closed")

def on_open(ws):
    print("🟢 Connected to Live Binance Ticker Stream...")
    print("🚀 Pumping real Wall Street data to Kafka 'market-ticks' topic...")

if __name__ == "__main__":
    # We use the all-market ticker stream
    ws_url = "wss://stream.binance.com:9443/ws/!ticker@arr"
    
    ws = websocket.WebSocketApp(
        ws_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    # Keeps the connection alive forever
    ws.run_forever()