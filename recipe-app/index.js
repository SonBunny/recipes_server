import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import recipeRoutes from './routes/RecipeRoute.js';

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://recipegenerator--psin2hviw0.expo.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

await mongoose.connect(process.env.MONGODB_URI);

app.use('/', recipeRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(process.env.PORT,"0.0.0.0", () => {
  console.log(`Server running PORT: ${process.env.PORT}`);
});
