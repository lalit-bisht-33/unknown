import express from "express"
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary"
import dotenv from "dotenv";


dotenv.config();

const app=express();
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.send("Server is running");
})

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoute);
app.use("/api/post",postRoute);

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key:process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});


const PORT=4000;
app.listen(PORT,(req,res)=>{
    connectDB();
    console.log(`Server is running on port: http://localhost:${PORT}`);
    
})