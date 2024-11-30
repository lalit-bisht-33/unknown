import express from "express";
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUser } from "../controllers/user.controller.js";
import { protectRoute } from "../../middlewares/protectRoute.js";

const router = express.Router();

router.post("/profile/:username",getUserProfile);
router.post("/suggested",protectRoute,getSuggestedUser);
router.post("/follow/:id",protectRoute,followUnfollowUser);
router.post("/update",protectRoute,updateUser);

export default router;