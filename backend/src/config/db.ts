import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/escm";
    if (uri === "memory") {
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log("Using in-memory MongoDB:", uri);
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
