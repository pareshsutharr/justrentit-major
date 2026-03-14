const RentProduct = require("../models/RentProduct");
const Notification = require("../models/notificationModel");
const Category = require("../models/Category");
const mongoose = require("mongoose");

const parseArrayField = (value) => {
    if (value === undefined || value === null || value === "") return [];
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
            return parsed ? [parsed] : [];
        } catch (error) {
            return [value];
        }
    }

    return [value];
};

const parseBooleanField = (value, fallback = false) => {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "boolean") return value;
    return value === "true";
};

const parseLocationField = (body) => {
    if (body.location) {
        if (typeof body.location === "string") {
            try {
                return JSON.parse(body.location);
            } catch (error) {
                return {
                    country: body.country || "",
                    state: body.state || "",
                    area: body.area || "",
                    pincode: body.pincode || "",
                };
            }
        }

        if (typeof body.location === "object") {
            return body.location;
        }
    }

    return {
        country: body.country || "",
        state: body.state || "",
        area: body.area || "",
        pincode: body.pincode || "",
    };
};

const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            rentalPrice,
            available,
            securityDeposit,
            rentalDuration,
            condition,
            isForSale,
            sellingPrice,
        } = req.body;

        const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
        const normalizedCategory = parseArrayField(req.body.category);
        const location = parseLocationField(req.body);
        const isAvailable = parseBooleanField(available, true);
        const isProductForSale = parseBooleanField(isForSale, false);

        const newProduct = new RentProduct({
            name,
            description,
            rentalPrice,
            category: normalizedCategory,
            userId: req.user._id,
            images,
            available: isAvailable,
            securityDeposit,
            rentalDuration,
            condition,
            isForSale: isProductForSale,
            sellingPrice,
            location,
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
            updates.category = parseArrayField(updates.category);
        }

        if (updates.location || updates.country || updates.state || updates.area || updates.pincode) {
            updates.location = {
                ...product.location?.toObject?.(),
                ...parseLocationField(updates),
            };
            delete updates.country;
            delete updates.state;
            delete updates.area;
            delete updates.pincode;
        }

        if (updates.available !== undefined) {
            updates.available = parseBooleanField(updates.available, product.available);
        }

        if (updates.isForSale !== undefined) {
            updates.isForSale = parseBooleanField(updates.isForSale, product.isForSale);
        }

        if (updates.featured !== undefined) {
            updates.featured = parseBooleanField(updates.featured, product.featured);
        }

        const updatedProduct = await RentProduct.findByIdAndUpdate(productId, updates, { new: true });
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ success: false, message: "Error updating product" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await RentProduct.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (String(product.userId) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
        }

        await RentProduct.findByIdAndDelete(productId);

        await Notification.create({
            userId: req.user._id,
            message: `Your product "${product.name}" has been deleted`,
            type: "product_deleted",
            metadata: {
                productId,
            }
        });

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ success: false, message: "Error deleting product" });
    }
};

module.exports = {
    addProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
};
