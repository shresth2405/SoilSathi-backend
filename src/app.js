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

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


import GardenerRouter from './routes/Gardener.routes.js'


app.use('/api/v1/Gardener', GardenerRouter)

initWebSocketServer(server)
app.get('/sensor/:deviceId', getData);


export default app;

