import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
export const protectRoute = async (req, res, next) => {
    try {
        console.log("Cookies received:", req.cookies); // Log cookies
        
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Signup or login first" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Log decoded token

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
