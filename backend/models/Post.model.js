import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
text:{
    type:String,
    required:true
},
img:{
    type:String,
    required:true
},
like:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:[],
    }
],
comments:[
    {
        text:{
            type:String,
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },default:[],
    }
]

},{timestamps:true})

const Post = mongoose.model("Post",PostSchema); 
export default Post;