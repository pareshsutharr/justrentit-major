const RentProduct = require("../models/RentProduct");
const Notification = require("../models/notificationModel");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            rentalPrice,
            category,
            available,
            country,
            state,
            area,
            pincode,
            securityDeposit,
            rentalDuration,
            condition,
            isForSale,
            sellingPrice,
        } = req.body;

        const images = req.files.map((file) => `/uploads/${file.filename}`);
        const isAvailable = available === "true";

        const newProduct = new RentProduct({
            name,
            description,
            rentalPrice,
            category,
            userId: req.user._id,
            images,
            available: isAvailable,
            securityDeposit,
            rentalDuration,
            condition,
            isForSale,
            sellingPrice,
            location: {
                country,
                state,
                area,
                pincode,
            },
        });

        const savedProduct = await newProduct.save();

        await Notification.create({
            userId: savedProduct.userId,
            message: `Your product "${savedProduct.name}" has been listed successfully`,
            type: "product_added",
            metadata: {
                productId: savedProduct._id,
            }
        });

        res.json({
            success: true,
            message: "Product added successfully!",
            product: savedProduct,
        });
    } catch (err) {
        console.error("Add product error:", err);
        res.status(500).json({
            success: false,
            message: "Error adding product!",
        });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        const products = await RentProduct.find({ userId })
            .populate('category');

        res.json({ success: true, products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await RentProduct.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // In a real app, verify req.user._id === product.userId

        const updates = { ...req.body };
        if (req.files && req.files.length > 0) {
            updates.images = req.files.map((file) => `/uploads/${file.filename}`);
        }

        if (updates.category) {
            try {
                const rawCategory = typeof updates.category === "string" ? JSON.parse(updates.category) : updates.category;
                updates.category = Array.isArray(rawCategory) ? rawCategory : [rawCategory];
            } catch (e) {
                // assume it's already an array or single ID
            }
        }

        const updatedProduct = await RentProduct.findByIdAndUpdate(productId, updates, { new: true });
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ success: false, message: "Error updating product" });
    }
};

module.exports = {
    addProduct,
    getMyProducts,
    updateProduct,
};
