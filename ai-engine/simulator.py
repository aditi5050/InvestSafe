import json
import time
import random
from kafka import KafkaProducer

# 1. Action: Connect to the Kafka broker running in your Docker container
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Initial fake prices for our watchlist
symbols = ['AAPL', 'TSLA', 'NVDA', 'BTC', 'ETH']
prices = {s: random.uniform(100, 1000) for s in symbols}

print("🚀 InvestSafe Market Simulator Started...")
print("Pumping data to Kafka topic: 'market-ticks'")

try:
    while True:
        for s in symbols:
            # Simulate a realistic small price movement
            change = random.uniform(-2.5, 2.5)
            prices[s] += change
            
            # Construct the data payload expected by our Zustand store
            data = {
                "symbol": s,
                "price": round(prices[s], 2),
                "change": round(change, 2)
            }
            
            # 2. Action: Fire the data into the 'market-ticks' topic
            producer.send('market-ticks', data)
            print(f"📡 Sent: {data['symbol']} @ ${data['price']} (Change: {data['change']})")
            
        # Wait 1 second before sending the next batch of ticks
        time.sleep(1) 
        
except KeyboardInterrupt:
    print("\n🛑 Stopping simulator...")