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
app.use(express.json());
const server = http.createServer(app);

// 2. Initialize WebSocket Server
const io = new Server(server, { cors: { origin: '*' } });

// 3. Initialize Redis Client
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('❌ Redis Client Error:', err));

// 4. Initialize Kafka Client
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER]
});
const kafkaAdmin = kafka.admin(); 
const kafkaConsumer = kafka.consumer({ groupId: 'investsave-ui-group' });

// --- CONNECTION BOOTSTRAP FUNCTION ---
async function startGateway() {
  try {
    console.log('⏳ Booting up InvestSave API Gateway...');

    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Connected to Redis Cache');

    // Connect Admin & Create Topics
    await kafkaAdmin.connect();
    await kafkaAdmin.createTopics({
      topics: [{ topic: 'market-ticks' }, { topic: 'analyzed-news' }, { topic: 'order-flow' }],
      waitForLeaders: true,
    });
    console.log('✅ Kafka Topics Created / Verified');
    await kafkaAdmin.disconnect();

    // Connect Consumer & Subscribe
    await kafkaConsumer.connect();
    console.log('✅ Connected to Kafka Cluster');

    await kafkaConsumer.subscribe({ topic: 'market-ticks', fromBeginning: false });
    await kafkaConsumer.subscribe({ topic: 'analyzed-news', fromBeginning: false });
    console.log('✅ Subscribed to Kafka Topics');

    // 🔴 THIS WAS MISSING: The actual listener that forwards data to the UI!
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const rawData = message.value.toString();
        const parsedData = JSON.parse(rawData);
        console.log(`📥 Kafka Received [${topic}]:`, parsedData); // Watch it arrive in terminal

        if (topic === 'market-ticks') {
          io.emit('market-tick', parsedData); // Forward to React
        } else if (topic === 'analyzed-news') {
          io.emit('news-alert', parsedData);
        }
      },
    });

    // Handle WebSocket Connections
    io.on('connection', (socket) => {
      console.log(`📡 New UI Client Connected: ${socket.id}`);
      socket.on('disconnect', () => console.log(`🔌 UI Client Disconnected: ${socket.id}`));
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