import express from 'express'
import cors from 'cors'
import http from 'http'
// import wss from 'ws'
// import { getData, initWebSocketServer } from './controllers/WsController.js';
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

// const server = http.createServer(app);


// Start server




import GardenerRouter from './routes/Gardener.routes.js'
import sensorRouter from './routes/Sensor.routes.js'

const PORT = process.env.PORT || 3000;


app.use('/api/v1/gardener', GardenerRouter)

app.use('/api/v1/sensor', sensorRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



export default app;

