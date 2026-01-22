import mongoose from "mongoose";
import config from "../config/config";

const uri = config.mongoUri; // your MongoDB Atlas URI

const connectToDatabase = async () => {
  // console.log("Mongo URI:", uri);
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables!");
  }

  try {
    const connection = await mongoose.connect(uri, {
      dbName: config.mongoDBName,
    });
    // console.log("Connected to MongoDB via Mongoose",connection);
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    throw error;
  }
};

export default connectToDatabase;
