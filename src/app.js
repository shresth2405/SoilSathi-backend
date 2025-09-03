import express from 'express'
import cors from 'cors'
import http from 'http'
import wss from 'ws'
import { getData, initWebSocketServer } from './controllers/WsController.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
}))
app.use(express.urlencoded({extended:true}));

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

const server = http.createServer(app);

const PORT = process.env.SOCKET_PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});



import GardenerRouter from './routes/Gardener.routes.js'


app.use('/api/v1/Gardener', GardenerRouter)

initWebSocketServer(server)
app.get('/sensor/:deviceId', getData);


export default app;

