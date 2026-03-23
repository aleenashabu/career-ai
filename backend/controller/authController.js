// controllers/authController.js
import User from "../models/user.js";
import Admin from "../models/admin.js";
import { hashPassword } from "../utils/hashPassword.js";
import { generateToken } from "../middleware/generateToken.js";
import bcrypt from "bcrypt";


export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, educationBg } = req.body;
        if (!fullName || !email || !password || !educationBg) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const exitingUser = await User.findOne({ email });
        if (exitingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const hashed = await hashPassword(password);
        const user = new User({
            fullname: fullName,
            email,
            password: hashed,
            educationBg
        });
        await user.save();
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const role = "user";
        const profileCompleted = user.profileCompleted || false;

        const token = generateToken(user._id, role);
        res.status(200).json({
            token,
            role,
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email,
                avatar: user.profilePic || null,
                profileCompleted
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

// Admin login controller

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(admin._id, 'admin');

        res.status(200).json({
            token,
            role: 'admin',
            user: {
                name: admin.name,
                email: admin.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Admin login failed", error: err.message });
    }
};