import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { commentPost, createPost, deletePost, getAllPost, getFollowingPost, getLikedPost, getUserPosts, likePost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create",protectRoute,createPost);
router.delete("/:id",protectRoute,deletePost);
router.post("/comment/:id",protectRoute,commentPost);
router.post("/like/:id",protectRoute,likePost);
router.get("/all",protectRoute,getAllPost);
router.get("/getlikes",protectRoute,getLikedPost);
router.get("/getFollowing",protectRoute,getFollowingPost);
router.get("/user/:username",protectRoute,getUserPosts);

export default router;