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

//enabling cors to handle requests from different origin
app.use(cors({
    origin: (origin, cb) => {
    // Allow no-origin (mobile apps, curl, Postman) and known dev hosts
    if (!origin) return cb(null, true);

    const allowList = [
      /^https:\/\/.*\.expo\.app$/,      // any Expo web subdomain
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000'
    ];

    const ok = allowList.some(rule => rule instanceof RegExp ? rule.test(origin) : rule === origin);
    return ok ? cb(null, true) : cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

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
