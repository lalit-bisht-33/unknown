import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost=async(req,res)=>{
try {
    const {text}=req.body;
    let {img}=req.body;
    const userId=req.user._id.toString();
    const user= await User.findById(userId)

    if(!user){
        return res.status(400).json({message:"User not found!!"})
    }

    if(!img && !text){
        return res.status(400).json({message:"Image and text must include!!"})
    }

    if(img){
        try {
            const uploadResponse = await cloudinary.uploader.upload(img);
            console.log("Cloudinary Upload Response:", uploadResponse);
            img = uploadResponse.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error.message);
            return res.status(400).json({ message: "Failed to upload image to Cloudinary" });
        }
    }

    const newPost= new Post({
        user:userId,
        text:text,
        img:img,
    })

    await newPost.save();
    res.status(200).json({message:"Post is created!!"})


} catch (error) {
    console.log("Error in createPost",error.message);
    res.status(400).json({error:"Internal Server Error!!"})

}
}