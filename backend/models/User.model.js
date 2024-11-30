import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
username:{
    type:String,
    required:true,
},
fullname:{
    type:String,
    required:true,
},
password:{
    type:String,
    required:true,
},
email:{
    type:String,
    required:true,
},
followers:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
    }
],
following:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
    }
],
profileImg:{
    type:String,
    default:""
},
bio:{
    type:String,
    default:""
},
likedPosts:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        default:[],
    }
]

},{timestamps:true})

const User = mongoose.model("User",UserSchema); 
export default User;