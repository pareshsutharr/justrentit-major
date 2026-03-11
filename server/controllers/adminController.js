const UserModel = require("../models/Users");
const RentProduct = require("../models/RentProduct");
const RentalRequest = require("../models/RentalRequest");
const Category = require("../models/Category");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const mongoose = require("mongoose");

const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            adminCount,
            totalProducts,
            verifiedProducts,
            pendingVerifications,
            totalRentalRequests,
            activeRentals,
            categoryCount,
            featuredProducts,
        ] = await Promise.all([
            UserModel.countDocuments(),
            UserModel.countDocuments({ role: "Admin" }),
            RentProduct.countDocuments(),
            RentProduct.countDocuments({ verified: true }),
            RentProduct.countDocuments({ verified: false }),
            RentalRequest.countDocuments(),
            RentalRequest.countDocuments({
                status: { $in: ["approved", "in_transit", "delivered", "in_use"] },
            }),
            Category.countDocuments(),
            RentProduct.countDocuments({ featured: true }),
        ]);

        res.json({
            totalUsers,
            adminCount,
            totalProducts,
            verifiedProducts,
            pendingVerifications,
            totalRentalRequests,
            activeRentals,
            categoryCount,
            featuredProducts,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const totalUsers = await UserModel.countDocuments();
        const adminCount = await UserModel.countDocuments({ role: "Admin" });
        const signups = await UserModel.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({ totalUsers, adminCount, signups });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user analytics" });
    }
};

const getProductAnalytics = async (req, res) => {
    try {
        const totalProducts = await RentProduct.countDocuments();
        const availableCount = await RentProduct.countDocuments({ available: true });
        const forSaleCount = await RentProduct.countDocuments({ isForSale: true });
        const categories = await RentProduct.aggregate([
            { $unwind: "$category" },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.name",
                    count: { $sum: 1 },
                },
            },
        ]);
        res.json({ totalProducts, availableCount, forSaleCount, categories });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product analytics" });
    }
};

const getRentalAnalytics = async (req, res) => {
    try {
        const activeRentals = await RentalRequest.countDocuments({
            status: { $in: ["in_transit", "delivered", "in_use"] },
        });

        const statusDistribution = await RentalRequest.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const totalRevenueResult = await RentalRequest.aggregate([
            { $match: { status: { $regex: /^completed$/i } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: "$totalPrice" } },
                },
            },
        ]);

        const totalRevenueGenerated = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        res.json({
            activeRentals,
            statusDistribution: statusDistribution.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            totalRevenue: totalRevenueGenerated,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const generateReport = async (req, res) => {
    try {
        const [users, products, rentals, categories] = await Promise.all([
            UserModel.find(),
            RentProduct.find(),
            RentalRequest.find(),
            Category.find(),
        ]);

        const doc = new PDFDocument({ margin: 50 });
        const filename = `Website-Report-${Date.now()}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        doc.pipe(res);

        doc.fontSize(22).font("Helvetica-Bold").text("Website Analytics Report", { align: "center" }).moveDown(0.5);
        doc.fontSize(12).font("Helvetica").text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm A")}`, { align: "right" }).moveDown(1);

        doc.fontSize(18).fillColor("#007BFF").text("User Statistics", { underline: true });
        doc.fontSize(12).fillColor("black")
            .text(`Total Users: ${users.length}`)
            .text(`Admins: ${users.filter((u) => u.role === "Admin").length}`)
            .text(`Verified Users: ${users.filter((u) => u.isVerified).length}`)
            .moveDown();

        doc.fontSize(18).fillColor("#007BFF").text("Product Analysis", { underline: true });
        doc.fontSize(12).fillColor("black")
            .text(`Total Products: ${products.length}`)
            .text(`Verified Products: ${products.filter((p) => p.verified).length}`)
            .text(`Featured Products: ${products.filter((p) => p.featured).length}`)
            .text(`Total Categories: ${categories.length}`)
            .moveDown();

        doc.fontSize(18).fillColor("#007BFF").text("Rental Activity", { underline: true });
        doc.fontSize(12).fillColor("black")
            .text(`Total Rental Requests: ${rentals.length}`)
            .text(`Completed Rentals: ${rentals.filter((r) => r.status === "completed").length}`)
            .text(`Active Rentals: ${rentals.filter((r) => ["in_use", "in_transit"].includes(r.status)).length}`)
            .moveDown();

        doc.end();
    } catch (error) {
        console.error("Report generation error:", error);
        res.status(500).json({ message: "Report generation failed" });
    }
};

module.exports = {
    getAdminStats,
    getUserAnalytics,
    getProductAnalytics,
    getRentalAnalytics,
    generateReport,
};
