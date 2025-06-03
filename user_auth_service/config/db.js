import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
//to establish a connection between the mongodb
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);//error handling
    process.exit(1);
  }
};