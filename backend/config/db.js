import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB=async()=>{
try {
    const conn = await mongoose.connect(process.env.MONGODB_CONN);
    console.log(`mongoDB is connected: ${conn.connection.host}`);
    
} catch (error) {
    console.log("Error occur to connect mongoDB",error);
    process.exit(1);
}
}