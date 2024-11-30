import express from "express";
import { getme, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../../middlewares/protectRoute.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.get("/me",protectRoute,getme);


export default router;