import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js"

export const createPost=async(req,res)=>{
try {
    const {text}=req.body;
    let {img}=req.body;
    const userId=req.user._id;
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

export const deletePost=async(req,res)=>{
   try {
     const {id:postId}=req.params;
     const userId=req.user._id;
     const post=await Post.findById(postId);
     if(!post){
         return res.status(400).json({message:"Post not found!!"})
     }
     if(userId.toString()!=post.user.toString()){
         return res.status(400).json({message:"Cannot delete another user post"})
     }
 
     if(post.img){
         const imgId=post.img.split("/").pop().split(".")[0];
         await cloudinary.uploader.destroy(imgId);
     }
 
     await Post.findByIdAndDelete(postId);
     res.status(400).json({json:"Post is deleted"})

   } catch (error) {
    console.log("Error in deletePost",error.message);
    res.status(400).json({error:"Internal Server Error!!"})

   }
}

export const commentPost=async(req,res)=>{
    try {
        const {id:postId}=req.params;
        const {text}=req.body;
        const userId=req.user._id;
        
        const post=await Post.findById(postId);
        if(!post){
            return res.status(400).json({message:"Post doesn't exist!!"});
        }
        if(!text){
            return res.status(400).json({message:"Require text to do comment"});

        }

        const comment={
            user:userId,
            text,
        }

        post.comments.push(comment);
        await post.save();

        return res.status(200).json({message:"You have commented"});


    } catch (error) {
        console.log("Error in commentPost",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
}

export const likePost=async(req,res)=>{
    try {
        const {id:postId}=req.params;
        const userId=req.user._id;
        
        const post=await Post.findById(postId);
        if(!post){
            return res.status(400).json({message:"Post doesn't exist!!"});
        }
        
        const userLikedPost=post.like.includes(userId);

        if(userLikedPost){
            await Post.updateOne({_id:postId},{$pull:{like:userId}}); //_id has to pass for updateOne
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
            res.status(200).json({message:"You unliked the post"});

        }
        else{
            post.like.push(userId);
            await post.save();
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})

           
            const newnotification= new Notification({
                from :userId,
                to:post.user,
                type:"like"
            })
            await newnotification.save();
            res.status(200).json({message:"You liked the post"});

        }
    } catch (error) {
        console.log("Error in likePost",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
}

export const getAllPost=async(req,res)=>{

    try {
       const posts=await Post.find()
                        .sort({createdAt:-1})
                        .populate({
                            path:"user",
                            select:"-password"
                        })
                        .populate({
                            path:"comments.user", //from model
                            select:"-password"
                        })


       if(posts.length===0){
        return res.status(200).json([]);

       }
       return res.status(200).json(posts);

        
    } catch (error) {
        console.log("Error in getAllPost",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }


}

export const getLikedPost=async(req,res)=>{ 
    const userId =req.user._id;
try {
    const user=await User.findById(userId);
    if(!user){
        res.status(400).json({message:"User not found!!"});
    }

    const likedPost=await Post.find({_id:{$in:user.likedPosts}})
                              .populate({
                                path:"user",
                                select:"-password"
                              })
                              .populate({
                                path:"comments.user",
                                select:"-password"
                              });
    res.status(200).json(likedPost);

} catch (error) {
    console.log("Error in getLikedPosts",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
}

export const getFollowingPost=async(req,res)=>{ 
    try {
        //user=>following.
        //following=>id.
        //id=>post
        const userId=req.user._id;
        const user=await User.findById(userId);

        const following=user.following;
        console.log(following); //object
        
        const followingPosts=await Post.find({user:{$in:following}})
                                       .sort({createdAt:-1})
                                       .populate({
                                        path:"user",
                                        select:"-password"
                                       })
                                       .populate({
                                        path:"comments.user",
                                        select:"-password"
                                       })
    res.status(200).json(followingPosts);

    } catch (error) {
        console.log("Error in getFollowingPosts",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
}

export const getUserPosts=async(req,res)=>{ 
try {
    const{username}=req.params;

    const user =await User.findOne({username})

    if(!user){
        res.status(400).json({json:"User doesn't exist!!"})
    }

    const posts=await Post.find({user:user._id}).sort({createdAt:-1})
    .populate({
     path:"user",
     select:"-password"
    })
    .populate({
     path:"comments.user",
     select:"-password"
    })
res.status(200).json(posts);

} catch (error) {
    console.log("Error in getUserPosts",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
}