from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import json
from kafka import KafkaProducer

# 1. LOAD THE BRAIN (FinBERT)
tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

producer = KafkaProducer(bootstrap_servers=['localhost:9092'], value_serializer=lambda v: json.dumps(v).encode('utf-8'))

def analyze_impact(headline):
    # Tokenize and predict
    inputs = tokenizer(headline, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    prediction = torch.nn.functional.softmax(outputs.logits, dim=-1)
    
    # Map results
    labels = ["Positive", "Negative", "Neutral"]
    max_idx = torch.argmax(prediction).item()
    sentiment = labels[max_idx]
    confidence = round(prediction[0][max_idx].item() * 100, 2)
    
    # Impact Reasoning Mapping
    impact_map = {
        "Positive": "BULLISH",
        "Negative": "BEARISH",
        "Neutral": "NEUTRAL"
    }

    return {
        "headline": headline,
        "impact": impact_map[sentiment],
        "confidence": f"{confidence}%",
        "reason": f"AI detected {sentiment.lower()} sentiment regarding market liquidity/earnings."
    }

# Example: Feed it a real headline
headline = "NVIDIA revenue beats estimates by 20%, shares surge in after-hours trading."
analysis = analyze_impact(headline)
producer.send('analyzed-news', analysis)
print(f"🧠 AI Analysis Sent: {analysis['impact']} ({analysis['confidence']})")