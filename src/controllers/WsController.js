import { WebSocketServer } from "ws";
import { Sensor } from "../models/SensorReading.models.js";

let latestData = null;

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Device connected via WebSocket");

    // Send last known data on new connection
    console.log(latestData);
    if (latestData) {
      ws.send(JSON.stringify(latestData));
    }

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(" Received sensor data:", data);

        latestData = data; // store in memory

        // Save to MongoDB (full ESP32 payload)
        await Sensor.create({
          deviceId: data.deviceId || "default-device",
          temperature: data.temperature,
          humidity: data.humidity,
          Nitrogen: data.Nitrogen,
          Phosphorus: data.Phosphorus,
          Potassium: data.Potassium,
          pH: data.pH,
          RainFall: data.RainFall,
          createdAt: new Date()
        });

        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
          }
        });

      } catch (err) {
        console.error("❌ Error parsing/saving data:", err);
      }
    });
  });

  return wss;
};

// API endpoint controller
export const getData = async (req, res) => {
  try {
    const {deviceId} = req.params;
    if (latestData) {
      return res.json({ source: "live", data: latestData });
    }

    const lastReading = await Sensor.findOne({deviceId}).sort({ createdAt: -1 });
    if (!lastReading) {
      return res.status(404).json({ message: "No data available" });
    }

    return res.json({ source: "database", data: lastReading });
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err.message });
  }
};
