# InvestSafe

InvestSafe: AI-Powered Financial Intelligence Terminal
InvestSafe is a professional-grade, high-density financial intelligence dashboard designed for real-time market monitoring and automated sentiment analysis. By integrating a distributed data pipeline with advanced NLP, the platform transforms raw market data and news into actionable insights.

Core Capabilities
High-Density Market Monitoring

Tracks a diverse watchlist of 15+ real-time assets, including global equities (AAPL, NVDA, TSLA), major cryptocurrencies (BTC, ETH, SOL), and critical commodities (Gold, Crude Oil).

Features a live, interactive TradingView Candlestick Chart for technical analysis across multiple timeframes.

Visualizes instant price fluctuations and percentage changes with color-coded indicators (Bullish/Bearish).

AI-Driven Impact Analysis

Live Intel Feed: Processes a continuous stream of financial headlines using Natural Language Processing (NLP).

Market Impact Scoring: Automatically classifies news as BULLISH, BEARISH, or NEUTRAL and provides a confidence score for each analysis.

Contextual Reasoning: Beyond simple sentiment, the system provides a "Reason" for each impact classification, explaining how specific news—such as Fed interest rate signals or supply chain delays—typically affects market liquidity and sector performance.

Real-Time Data Architecture

Distributed Stream Processing: Utilizes a Kafka message broker to handle high-throughput market ticks and news events with sub-second latency.

Unified WebSocket Gateway: A centralized Node.js gateway bridges the gap between low-level data streams and the user interface, ensuring seamless real-time updates without page refreshes.

Intelligent Caching: Leverages Redis for state management and fast retrieval of historical market data.

Pro-Grade User Interface

Dynamic Intelligence Workspace: Built on a fully customizable, draggable, and resizable grid layout that allows users to prioritize their view (e.g., expanding the chart or the news feed as needed).

Live Market TV: Integrates a dynamic live-stream component for real-time financial news broadcasts (CNBC, Bloomberg), allowing for a multi-sensory monitoring experience.

Dark Mode Optimization: Designed with a high-contrast, terminal-style aesthetic to reduce eye strain and maximize readability of dense data sets.

Tech Stack
Frontend: Next.js 15+, Tailwind CSS v4, Zustand, Socket.io-client, React-Grid-Layout.

Backend: Node.js, Express, Socket.io, KafkaJS.

Data Pipeline: Apache Kafka, Redis.

AI/Simulation: Python 3, Hugging Face Transformers (FinBERT), Kafka-Python.
