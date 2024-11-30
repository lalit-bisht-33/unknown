import Notification from "../models/notification.model.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"

export const getUserProfile=async(req,res)=>{
    const {username} =req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(400).json({message:"User does not exist!!"})
        }
    
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
   
}

export const followUnfollowUser=async(req,res)=>{
const {id} = req.params;
const userId= req.user._id;

const currentUser= await User.findById(userId);
const UsertoModify=await User.findById(id);

try {
    if(id===userId.toString()){
        return res.status(400).json({message:"You cannot follow/unfollow yourself!!"})

    }
const isfollowing=currentUser.following.includes(id);

if(isfollowing){
//unfollow
await User.findByIdAndUpdate(id,{$pull:{followers:userId}});
await User.findByIdAndUpdate(userId,{$pull:{following:id}});
res.status(200).json({message:"User is unfollow successfully"})
}
else{
//follow
await User.findByIdAndUpdate(id,{$push:{followers:userId}});
await User.findByIdAndUpdate(userId,{$push:{following:id}});

//notification
const newNotification=new Notification({
    type:"follow",
    from:userId,
    to:UsertoModify._id,
})
await newNotification.save();
res.status(200).json({message:"User is follow successfully"})

}
} catch (error) {
    console.log("Error in following",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
}

export const getSuggestedUser=async(req,res)=>{
    const userId=req.user._id;

    try {    
    const userFollowedByMe=await User.findById(userId).select("-password");
    const users=await User.aggregate([
        {
            $match:{
                _id:{
                    $ne:userId,
                }
        }
        },
        {
            $sample:{
            size:10 
            }
        },
        {
        $project: {
            password: 0, // Exclude password field
        },
        }
    ]);

    const filteredUsers=users.filter((user)=>!userFollowedByMe.following.includes(user._id.toString()));
    const suggestedUsers= filteredUsers.slice(0,4);

    res.status(200).json(suggestedUsers);

} catch (error) {
        console.log("Error in suggestedUser",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
}

export const updateUser=async(req,res)=>{
const {fullname,username,email,currentpassword,newpassword,bio}=req.body;
let {profileImg}=req.body;

try{
    
//let because we update it below
let user=await User.findById(req.user._id);

if ((!currentpassword && newpassword) || (!newpassword && currentpassword)) {
    return res.status(400).json({
        message: "Please provide both current password and new password to update.",
    });
}

if(currentpassword && newpassword){
    const ismatch=await bcrypt.compare(currentpassword,user.password);
    if(!ismatch){
    return res.status(400).json({message:"Original password not match!!"})
    }
}
if(newpassword.length<6){
    return res.status(400).json({message:"Password must be of 6 character long!!"})
}

const salt=await bcrypt.genSalt(10);
user.password=await bcrypt.hash(newpassword,salt);


if(profileImg){
    if(user.profileImg){
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
    }
    const uploadResponse=await cloudinary.uploader.upload(profileImg);
    profileImg=uploadResponse.secure_url;
}


    user.fullname=fullname||user.fullname,
    user.email=email ||user.email,
    user.username=username ||username.email,
    user.bio=bio ||user.bio,
    user.profileImg=profileImg ||user.profileImg,
    user=await user.save();


    //for display it already save above
    user.password=null;
    res.status(400).json(user);

}
catch(error){
    console.log("Error in updateUser",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
}
