#!/bin/bash

echo "🚀 Booting InvestSafe Terminal Stack..."

# 1. Start Kafka and Redis in the background
echo "🐳 Starting Infrastructure..."
docker-compose up -d

# 2. Wait 3 seconds for Kafka to be fully ready
sleep 3

# 3. Use npx concurrently to run everything else in one terminal with color-coded logs
echo "⚡ Igniting Engines..."
npx concurrently \
  -n "GATEWAY,REACT,MARKET,NEWS,ANOMALY" \
  -c "bgBlue.bold,bgMagenta.bold,bgGreen.bold,bgYellow.bold,bgRed.bold" \
  "cd backend && node index.js" \
  "cd frontend && npm run dev" \
  "cd ai-engine && python3 dynamic_market_engine.py" \
  "cd ai-engine && python3 news_engine.py" \
  "cd ai-engine && python3 anomaly_engine.py"