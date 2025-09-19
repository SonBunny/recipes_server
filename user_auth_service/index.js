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
const allowedOrigins = [
  'http://localhost:19006', // Expo web dev
  'http://localhost:3000',
  'http://localhost:8081',
  'https://recipegenerator--psin2hviw0.expo.app', // your current Expo web URL
  /\.expo\.app$/,  // any Expo web preview subdomain
  /\.expo\.dev$/,  // sometimes Expo uses .expo.dev
];

app.use(cors({
  origin(origin, cb) {
    // allow non-browser requests (like curl/postman) which send no Origin
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // Let the cors lib reflect whatever headers the browser asks for.
  // (Your previous `allowedHeaders: ['Content-Type']` was blocking e.g. Authorization)
  allowedHeaders: undefined,
  credentials: true,    // only if you use cookies/auth headers and need them cross-site
  maxAge: 86400,        // cache the preflight for a day
}));

// Ensure Express answers preflight everywhere
app.options('*', cors());

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
