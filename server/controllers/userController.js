const UserModel = require("../models/Users");
const RentProduct = require("../models/RentProduct");
const Notification = require("../models/notificationModel");
const RentalRequest = require("../models/RentalRequest");
const ChatMessage = require("../models/ChatMessage");
const Message = require("../models/Message");
const Rating = require("../models/Rating");
const { isPasswordMatch } = require("../utils/authUtils");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const removeUploadedFile = async (filePath) => {
    if (!filePath || typeof filePath !== "string" || !filePath.startsWith("/uploads/")) return;
    const absolutePath = path.join(__dirname, "..", filePath.replace(/^\//, ""));
    try {
        await fs.promises.unlink(absolutePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove uploaded file:", absolutePath, error);
        }
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.query;
        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId, address, phone } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const profilePhoto = req.file ? `/uploads/${req.file.filename}` : undefined;
        const updateFields = { address, phone };

        if (profilePhoto) {
            updateFields.profilePhoto = profilePhoto;
        }

        if (phone) {
            const existingUser = await UserModel.findOne({
                phone: phone,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already in use"
                });
            }
        }

        const updatedUser = await UserModel.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        await Notification.create({
            userId: updatedUser._id,
            message: 'Profile updated successfully',
            type: 'profile_update',
            metadata: {
                fields: Object.keys(updateFields),
            },
        });

        res.json({
            success: true,
            user: updatedUser
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({
            success: false,
            message: "Error updating profile"
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { confirmation, currentPassword } = req.body || {};
        const user = await UserModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (confirmation !== "DELETE") {
            return res.status(400).json({
                success: false,
                message: 'Type DELETE to confirm account deletion',
            });
        }

        if (user.password && !isPasswordMatch(currentPassword || "", user.password)) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const products = await RentProduct.find({ userId: user._id }).select("images");
        const productIds = products.map((product) => product._id);
        const uploadedProductImages = products.flatMap((product) => product.images || []);

        await Promise.all([
            Notification.deleteMany({ userId: user._id }),
            Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] }),
            ChatMessage.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] }),
            RentalRequest.deleteMany({ $or: [{ requester: user._id }, { owner: user._id }, { product: { $in: productIds } }] }),
            Rating.deleteMany({
                $or: [
                    { rater: user._id },
                    { ratedUser: user._id },
                    { ratedProduct: { $in: productIds } },
                ],
            }),
            RentProduct.deleteMany({ userId: user._id }),
            UserModel.findByIdAndDelete(user._id),
        ]);

        await Promise.all([
            removeUploadedFile(user.profilePhoto),
            ...uploadedProductImages.map((imagePath) => removeUploadedFile(imagePath)),
        ]);

        return res.json({
            success: true,
            message: "Your account has been deleted",
        });
    } catch (error) {
        console.error("Account deletion error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete account",
        });
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    deleteAccount,
};
