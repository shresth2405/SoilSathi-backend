import express from 'express'
import cors from 'cors'
import http from 'http'
// import wss from 'ws'
import { getData, initWebSocketServer } from './controllers/WsController.js';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
}))
app.use(express.urlencoded({extended:true}));

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// const server = http.createServer(app);
const server = http.createServer(app);

// Attach WebSocketServer
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  console.log("🌐 WebSocket client connected");
  ws.on("message", (msg) => {
    console.log("📩", msg.toString());
    ws.send("Echo: " + msg);
  });
});

// Start server


const PORT = process.env.SOCKET_PORT || 8080;




import GardenerRouter from './routes/Gardener.routes.js'


app.use('/api/v1/gardener', GardenerRouter)

initWebSocketServer(server)
app.get('/sensor/:deviceId', getData);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



export default app;

