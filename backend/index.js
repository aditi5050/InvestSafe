require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { Kafka } = require('kafkajs');

// 1. Initialize Express & HTTP Server
const app = express();
app.use(cors());
app.use(express.json()); // Allows Node to read JSON requests from React

// Add a simple health-check route to prevent "Cannot GET /" errors
app.get('/', (req, res) => {
  res.send('🚀 InvestSafe Gateway is LIVE and routing data...');
});

const server = http.createServer(app);

// 2. Initialize WebSocket Server
const io = new Server(server, { cors: { origin: '*' } });

// 3. Initialize Redis Client
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err));

// 4. Initialize Kafka Client
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'investsave-gateway',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});
const kafkaAdmin = kafka.admin(); 
const kafkaConsumer = kafka.consumer({ groupId: 'investsave-ui-group' });
const kafkaProducer = kafka.producer(); // 🔴 NEW: Allows Node to push commands to Python

// --- CONNECTION BOOTSTRAP FUNCTION ---
async function startGateway() {
  try {
    console.log('⏳ Booting up InvestSafe API Gateway...');

    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Connected to Redis Cache');

    // Connect Admin & Create Topics
    await kafkaAdmin.connect();
    await kafkaAdmin.createTopics({
      topics: [
        { topic: 'market-ticks' }, 
        { topic: 'analyzed-news' }, 
        { topic: 'order-flow' },
        { topic: 'market-alerts' },
        { topic: 'new-assets' } // 🔴 NEW: Topic for React to send assets to Python
      ],
      waitForLeaders: true,
    });
    console.log('✅ Kafka Topics Created / Verified');
    await kafkaAdmin.disconnect();

    // Connect Producer & Consumer
    await kafkaProducer.connect();
    console.log('✅ Connected Kafka Producer');
    
    await kafkaConsumer.connect();
    console.log('✅ Connected Kafka Consumer');

    await kafkaConsumer.subscribe({ topic: 'market-ticks', fromBeginning: false });
    await kafkaConsumer.subscribe({ topic: 'analyzed-news', fromBeginning: false });
    await kafkaConsumer.subscribe({ topic: 'market-alerts', fromBeginning: false });
    console.log('✅ Subscribed to Kafka Topics');

    // The listener that forwards data to the UI
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const rawData = message.value.toString();
        const parsedData = JSON.parse(rawData);

        if (topic === 'market-ticks') {
          io.emit('market-tick', parsedData); 
        } else if (topic === 'analyzed-news') {
          io.emit('news-alert', parsedData);
        } else if (topic === 'market-alerts') {
          io.emit('anomaly-alert', parsedData); 
        }
      },
    });

    // Handle WebSocket Connections
    io.on('connection', (socket) => {
      console.log(`📡 New UI Client Connected: ${socket.id}`);
      socket.on('disconnect', () => console.log(`🔌 UI Client Disconnected: ${socket.id}`));
    });

    // 🔴 NEW API ROUTE: Receives search bar commands from React and pushes to Python
    app.post('/add-asset', async (req, res) => {
      const { symbol } = req.body;
      if (!symbol) return res.status(400).send('Symbol required');

      console.log(`➕ UI requested to track new asset: ${symbol}`);
      
      try {
        await kafkaProducer.send({
          topic: 'new-assets',
          messages: [{ value: JSON.stringify({ symbol }) }],
        });
        res.sendStatus(200);
      } catch (err) {
        console.error('❌ Failed to push to Kafka:', err);
        res.status(500).send('Internal Error');
      }
    });

    // Start listening
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Gateway routing traffic on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Gateway Boot Error:', error);
    process.exit(1);
  }
}

startGateway();