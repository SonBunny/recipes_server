import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';


const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;



app.use(cors({
  origin: [
    'http://localhost:19006',
    /\.expo\.app$/,
    /\.expo\.dev$/,
    'https://recipegenerator--psin2hviw0.expo.app',
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: undefined, // reflect requested headers
}));
app.options(/.*/, cors());

//loging details of all the incoming requests such as HTTP method,path, and origin
app.use((req, res, next) => {
  console.log(`[Auth Service] Incoming ${req.method} request to ${req.path} from origin: ${req.get('origin')}`);
  next();
});
//health check endpoint to check the service is up and running
app.get('/health', (req, res) => {
  console.log('[Auth Service] Health check received from gateway');
  res.status(200).json({ 
    status: 'ok',
    service: 'user-auth',
    timestamp: new Date().toISOString()
  });
});


app.use('/auth', (req, res, next) => {
  console.log(`[Auth Service] Routing ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes);



if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT,"0.0.0.0", () => {
        console.log(`User Auth Service running on port ${PORT}`);
      });
    })
    .catch(err => console.error('MongoDB connection error:', err));
}

export default app;
