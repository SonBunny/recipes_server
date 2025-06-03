import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import recipeRoutes from './routes/RecipeRoute.js';

const app = express();
app.use(express.json());



//enabling cors to handle requests from different origin
app.use(cors({
  origin: 'http://192.168.1.108:8081', // Your gateway URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
// MongoDB Connection
await mongoose.connect(process.env.MONGODB_URI);

// Routes
app.use('/', recipeRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});