#!/bin/bash

echo "🚀 Booting InvestSafe Terminal Stack in separate windows..."

# 1. Start Docker (runs silently in the background)
echo "🐳 Starting Infrastructure (Kafka & Redis)..."
docker-compose up -d

# Wait 3 seconds for Kafka to be ready
sleep 3

# 2. Open new Terminal window for Node Gateway
echo "⚡ Starting Backend Gateway..."
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/backend && node index.js"'

# 3. Open new Terminal window for Next.js UI
echo "⚡ Starting React Frontend..."
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/frontend && npm run dev"'

# 4. Open new Terminal window for the Live Market Engine
echo "⚡ Starting Dynamic Market Engine..."
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/ai-engine && python3 dynamic_market_engine.py"'

# 5. Open new Terminal window for the AI News Engine
echo "⚡ Starting AI News Engine..."
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/ai-engine && python3 news_engine.py"'

# 6. Open new Terminal window for the Math/Anomaly Engine
echo "⚡ Starting Anomaly Engine..."
osascript -e 'tell app "Terminal" to do script "cd '$PWD'/ai-engine && python3 anomaly_engine.py"'

echo "✅ All systems launched successfully! Check your new terminal windows."