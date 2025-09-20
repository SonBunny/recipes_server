import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

import {authenticate,authenticateSeller} from './middlewares/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;



// Allow requests from your React app origin only
const allowedOrigins = [
  'http://localhost:19006',
  /\.expo\.app$/,
  /\.expo\.dev$/,
  'http://recipegenerator--psin2hviw0.expo.app',
];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  // Reflect browser-requested headers; don’t hardcode ['Content-Type'].
  allowedHeaders: undefined,
  credentials: false,       // keep false unless you actually need cookies
  maxAge: 86400,
}));

// Express 5+: don't use '*' — use regex
app.options(/.*/, cors());

// 1. Critical Path Preservation Middleware
app.use('/auth', (req, res, next) => {
  console.log(`[Gateway] Forwarding ${req.method} ${req.originalUrl}`);
  req.url = req.originalUrl; // Preserve full original URL
  next();
});

// 2. Proxy Configuration with Absolute Path Control
const authProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path) => {
    console.log(`Rewriting path: ${path} → ${path}`);
    return path; // Explicitly return unchanged path
  },
  logLevel: 'debug',
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = req.originalUrl; // Force original path
      console.log(`Proxying to: ${proxyReq.path}`);
    },
    error: (err, req, res) => {
      console.error(`[Gateway Error] ${err.code} for ${req.method} ${req.originalUrl}`);
      if (!res.headersSent) {
        res.status(502).json({
          error: "Service unavailable",
          details: `Failed to reach ${req.originalUrl}`,
          status: 502
        });
      }
    }
  }
});

// 3. Route Mounting
app.use('/auth',authProxy);




app.use('/recipes', (req, res, next) => {
  console.log(`[Gateway] Forwarding ${req.method} ${req.originalUrl}`);
  next();
});

const recipeProxy = createProxyMiddleware({
  target: process.env.RECIPE_SERVICE_URL,
  changeOrigin: true,
  logLevel: 'debug',
  on: {
    proxyReq: (proxyReq, req) => {
      // Ensure x-user-id is set (fallback to header or 'unknown')
      const userId = req.user?._id || req.headers['x-user-id'] || 'unknown';
      proxyReq.setHeader('x-user-id', userId);
      
      console.log(`[Proxy][Recipe] → ${req.method} ${req.originalUrl} (User: ${userId})`);
    },
    error: (err, req, res) => {
      console.error(`[Gateway Error][Recipe] ${err.code || 'UNKNOWN'} for ${req.method} ${req.originalUrl}`, err.message);
      
      if (!res.headersSent) {
        res.status(502).json({
          error: "Recipe Service Unavailable",
          details: err.message || `Failed to proxy ${req.originalUrl}`,
          status: 502
        });
      }
    }
  }
});

// Ensure authentication before proxying
app.use('/recipes', authenticate, recipeProxy);



app.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Gateway running on port ${PORT}`);
  console.log(`🔗 Auth endpoint: /auth → ${process.env.USER_SERVICE_URL || 'http://192.168.1.108:5006'}/auth`);
  
  console.log(`🔗 Recipe endpoint: /recipes → ${process.env.RECIPE_SERVICE_URL || 'http://192.168.1.108:3000'}/recipes`);
  
});
