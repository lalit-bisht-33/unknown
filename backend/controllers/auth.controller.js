import User from "../models/User.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie} from "../../lib/utils/generateToken.js";

export const signup=async(req,res)=>{

    try {
        const {fullname,username,email,password}=req.body;

        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message:"User is already exist!!"});
        }

        const existingEmail=await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message:"Email is already exist!!"});
        }

        const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex){
            return res.status(400).json({message:"Inavlid Format for email!!"});
        }
        
        if(password.length<6){
            return res.status(400).json({message:"Password must be 6 character long!!"});
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword= await bcrypt.hash(password,salt);

        const newUser= new User({
            fullname,
            username,
            email,
            password:hashPassword,
        })
        
        // token generation
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            res.status(200).json({
                _id:newUser._id,
                fullname:newUser.fullname,
                username:newUser.username,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                bio:newUser.bio,
            })
        }
        else{
            res.status(400).json({error:"Invalid User data!!"})
        }
    } catch (error) {
        console.log("Error in signup",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
};

export const login=async(req,res)=>{
try {
    const {username,password}=req.body;
    if(username=="" || password==""){
        return res.status(400).json({message:"Enter username & password"});
    }

    const user= await User.findOne({username});
    if (!user) {
        return res.status(400).json({message: "Username or password is not found!!"});
    }
    
    const ispassword= await bcrypt.compare(password,user?.password || "");

    if(!user || !ispassword){
        return res.status(400).json({message:"Username or password is not found!!"});
    }

    generateTokenAndSetCookie(user._id,res);

    res.status(200).json({
        _id:user._id,
        fullname:user.fullname,
        username:user.username,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        bio:user.bio,
    });

    console.log("login success",user)
} catch (error) {
    console.log("Error in signup",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
};

export const logout = async(req,res)=>{
try {
    res.cookie("jwt", "", {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({message:"logout successfull"})
} catch (error) {
    console.log("Error in signup",error.message);
    res.status(400).json({error:"Internal Server Error!!"})
}
}

export const getme = async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select("-password")
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in signup",error.message);
        res.status(400).json({error:"Internal Server Error!!"})
    }
}