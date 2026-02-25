import json
import time
import random
import torch
from kafka import KafkaProducer
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 1. Initialize Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# 2. LOAD FINBERT
print("📥 Loading FinBERT NLP Model...")
tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

def analyze_sentiment(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    labels = ["BULLISH", "BEARISH", "NEUTRAL"]
    val, idx = torch.max(probs, dim=1)
    
    return labels[idx.item()], f"{round(val.item() * 100)}%"

HEADLINES = [
    "Tech giants report record-breaking quarterly earnings.",
    "Central bank signals aggressive interest rate hikes to combat inflation.",
    "Global chip shortage expected to ease by late 2026.",
    "Major oil producer announces sudden production cut."
]

print("🧠 Real AI Intel Engine is ONLINE. Streaming infinitely...")

try:
    # 🔴 THE FIX: Infinite loop so the script never closes
    while True: 
        # Pick a random headline
        headline = random.choice(HEADLINES)
        
        # Run real AI inference
        impact, confidence = analyze_sentiment(headline)
        
        # Generate Actionable Advice
        if impact == "BULLISH":
            summary = "Positive momentum detected in the text."
            suggestion = "Consider increasing exposure to correlated assets."
        elif impact == "BEARISH":
            summary = "Risk-off sentiment detected; algorithms are pricing in downside."
            suggestion = "Hedge long positions or tighten trailing stop-losses."
        else:
            summary = "Market absorbing news without a clear directional bias."
            suggestion = "Maintain current allocations; await clearer volume signals."

        data = {
            "headline": headline,
            "impact": impact,
            "confidence": confidence,
            "category": "Macro",
            "summary": summary,
            "suggestion": suggestion
        }
        
        producer.send('analyzed-news', data)
        print(f"📰 Analyzed: {headline} -> {impact} ({confidence})")
        
        # Wait 8 seconds before sending the next analysis
        time.sleep(8)
        
except KeyboardInterrupt:
    print("\n🛑 Engine Stopped.")