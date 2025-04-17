const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const RentProduct = require('../models/RentProduct');
const RentalRequest = require('../models/RentalRequest');
const Category = require('../models/Category');

router.get('/stats', async (req, res) => {
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
            featuredProducts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'Admin' }),
            RentProduct.countDocuments(),
            RentProduct.countDocuments({ verified: true }),
            RentProduct.countDocuments({ verified: false }),
            RentalRequest.countDocuments(),
            RentalRequest.countDocuments({ status: { $in: ['approved', 'in_transit', 'delivered', 'in_use'] } }),
            Category.countDocuments(),
            RentProduct.countDocuments({ featured: true })
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
            featuredProducts
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
