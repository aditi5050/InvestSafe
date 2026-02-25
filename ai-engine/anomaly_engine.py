import json
import numpy as np
from collections import deque
from kafka import KafkaConsumer, KafkaProducer

# 1. Connect to Kafka
consumer = KafkaConsumer('market-ticks', bootstrap_servers=['localhost:9092'], value_deserializer=lambda m: json.loads(m.decode('utf-8')))
producer = KafkaProducer(bootstrap_servers=['localhost:9092'], value_serializer=lambda v: json.dumps(v).encode('utf-8'))

# 2. Keep a rolling window of the last 50 ticks for each asset
history = {}
WINDOW_SIZE = 50
Z_SCORE_THRESHOLD = 2.5 # Anything beyond 2.5 standard deviations is a spike

print("🚨 InvestSafe Anomaly Detection Engine ONLINE...")

for message in consumer:
    tick = message.value
    sym = tick['symbol']
    price = tick['price']
    
    if sym not in history:
        history[sym] = deque(maxlen=WINDOW_SIZE)
        
    history[sym].append(price)
    
    # Need a full window to calculate accurate volatility
    if len(history[sym]) == WINDOW_SIZE:
        data = np.array(history[sym])
        mean = np.mean(data)
        std_dev = np.std(data)
        
        # Avoid division by zero if price is perfectly flat
        if std_dev > 0:
            z_score = (price - mean) / std_dev
            
            # Detect Price Spikes / Abnormal Volatility
            if abs(z_score) > Z_SCORE_THRESHOLD:
                anomaly_type = "BULLISH SPIKE" if z_score > 0 else "BEARISH CRASH"
                alert = {
                    "symbol": sym,
                    "type": anomaly_type,
                    "severity": "HIGH",
                    "z_score": round(z_score, 2),
                    "message": f"Abnormal volatility detected in {sym}. Price is {round(z_score, 2)} standard deviations from the mean."
                }
                # Send to a new Kafka topic
                producer.send('market-alerts', alert)
                print(f"⚠️ ANOMALY: {sym} | {anomaly_type} | Z: {np.round(z_score, 2)}")