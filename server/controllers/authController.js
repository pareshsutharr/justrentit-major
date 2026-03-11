const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const UserModel = require("../models/Users");
const { hashPassword, isPasswordMatch } = require("../utils/authUtils");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedName = name?.trim();
        const normalizedPhone = phone?.trim();
        const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

        if (!normalizedName || !normalizedEmail || !normalizedPhone || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided.",
            });
        }

        if (!/^[0-9]{10}$/.test(normalizedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }

        const existingUser = await UserModel.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already exists!",
            });
        }

        const newUser = await UserModel.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashPassword(password),
            phone: normalizedPhone,
            profilePhoto,
        });

        return res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        console.error("Register error:", err);
        if (err?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number already exists!",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Registration failed.",
            error: err?.message || "Unknown error",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are required." });
        }

        const user = await UserModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: "No record found" });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Use Google login for this account.",
            });
        }

        if (!isPasswordMatch(password, user.password)) {
            return res.status(401).json({
                success: false,
                message: "The password is incorrect",
            });
        }

        // Auto-migrate legacy plain-text passwords to hashed format.
        if (!user.password.startsWith("sha256$")) {
            user.password = hashPassword(password);
            user.save().catch(() => { });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '12h'
        });

        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                about: user.about,
                profilePhoto: user.profilePhoto,
                role: user.role || "User",
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Login failed.",
            error: err?.message || "Unknown error",
        });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload.email_verified) {
            return res
                .status(400)
                .json({ success: false, message: "Google email not verified" });
        }

        let user = await UserModel.findOne({
            $or: [{ googleId: payload.sub }, { email: payload.email }],
        });

        if (!user) {
            user = new UserModel({
                _id: new mongoose.Types.ObjectId(),
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                profilePhoto: payload.picture,
                isVerified: true,
                role: "User",
                ratings: 0,
            });
            await user.save();
        } else {
            let shouldSave = false;

            if (!user.googleId) {
                user.googleId = payload.sub;
                shouldSave = true;
            }

            if (!user.profilePhoto && payload.picture) {
                user.profilePhoto = payload.picture;
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '12h'
        });

        res.json({
            success: true,
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                profilePhoto: user.profilePhoto,
                googleId: user.googleId,
                role: user.role || "User",
            },
        });
    } catch (error) {
        console.error("Google auth error:", error);
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            success: false,
            message: "Google authentication failed",
            error: error?.message || "Unknown error",
        });
    }
};

module.exports = {
    register,
    login,
    googleAuth,
};
