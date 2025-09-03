import { WebSocketServer } from "ws";
import { Sensor } from "../models/SensorReading.models.js";

let latestData = null;
let connectedClients = new Set();

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/', // Explicitly set path
  });

  wss.on("connection", (ws, req) => {
    console.log(`🔌 New WebSocket connection from ${req.socket.remoteAddress}`);
    connectedClients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to SoilSathi server',
      timestamp: new Date().toISOString()
    }));

    // Send last known data on new connection
    if (latestData) {
      console.log("📤 Sending latest data to new client");
      ws.send(JSON.stringify({
        type: 'sensorData',
        data: latestData,
        timestamp: new Date().toISOString()
      }));
    }

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("📊 Received sensor data:", data);

        // Handle different message types
        if (data.type === 'deviceConnect') {
          console.log(`📱 Device ${data.deviceId} connected`);
          return;
        }

        // Store sensor data
        latestData = {
          ...data,
          receivedAt: new Date().toISOString()
        };

        // Save to MongoDB with better error handling
        try {
          await Sensor.create({
            deviceId: data.deviceId || "ESP32_001",
            temperature: parseFloat(data.temperature) || 0,
            humidity: parseFloat(data.humidity) || 0,
            Nitrogen: parseFloat(data.nitrogen || data.Nitrogen) || 0,
            Phosphorus: parseFloat(data.phosphorus || data.Phosphorus) || 0,
            Potassium: parseFloat(data.potassium || data.Potassium) || 0,
            pH: parseFloat(data.pH) || 7.0,
            RainFall: parseFloat(data.rainfall || data.RainFall) || 0,
            createdAt: new Date()
          });
          console.log("💾 Data saved to database");
        } catch (dbError) {
          console.error("❌ Database save error:", dbError.message);
        }

        // Broadcast to all connected clients
        const broadcastData = {
          type: 'sensorUpdate',
          data: latestData,
          clientCount: connectedClients.size,
          timestamp: new Date().toISOString()
        };

        let broadcastCount = 0;
        connectedClients.forEach((client) => {
          if (client.readyState === client.OPEN && client !== ws) {
            client.send(JSON.stringify(broadcastData));
            broadcastCount++;
          }
        });

        console.log(`📡 Broadcasted to ${broadcastCount} clients`);

        // Send acknowledgment back to sender
        ws.send(JSON.stringify({
          type: 'ack',
          message: 'Data received and saved',
          timestamp: new Date().toISOString()
        }));

      } catch (err) {
        console.error("❌ Error processing message:", err);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process data',
          error: err.message
        }));
      }
    });

    ws.on('close', () => {
      console.log("🔌 WebSocket connection closed");
      connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error("❌ WebSocket error:", error);
      connectedClients.delete(ws);
    });

    // Ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Health check interval
  const interval = setInterval(() => {
    connectedClients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log("💀 Terminating dead connection");
        ws.terminate();
        connectedClients.delete(ws);
        return;
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log("🔌 WebSocket server initialized");
  return wss;
};

// API endpoint controller
export const getData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (latestData && (!deviceId || latestData.deviceId === deviceId)) {
      return res.json({ 
        source: "live", 
        data: latestData,
        connectedClients: connectedClients.size,
        timestamp: new Date().toISOString()
      });
    }

    const lastReading = await Sensor.findOne(
      deviceId ? { deviceId } : {}
    ).sort({ createdAt: -1 });
    
    if (!lastReading) {
      return res.status(404).json({ 
        message: "No data available",
        deviceId: deviceId || 'any'
      });
    }

    return res.json({ 
      source: "database", 
      data: lastReading,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ getData error:", err);
    res.status(500).json({ 
      message: "Error fetching data", 
      error: err.message 
    });
  }
};