const http = require('http');
const { Server } = require('socket.io');
const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/products"); // Import the routes
const multer = require("multer");
const path = require("path");
const UserModel = require("./models/Users");
const RentProduct = require("./models/RentProduct");
const Location = require("./models/Location");
const RentalRequest = require("./models/RentalRequest"); // Adjust the path if needed
const ChatMessage = require("./models/ChatMessage");
const fs = require("fs");
const Category = require("./models/Category");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const userRoutes = require("./routes/userRoutes");
const Notification = require("./models/notificationModel");
const notificationRoutes = require("./routes/notificationRoutes"); // Import the notification routes
const rentalRequestsRouter = require('./routes/rentalRequests');
const userManagementRoutes = require('./routes/userManagementRoutes');
// const dashboardRoutes = require('./routes/dashboard');
const adminStatsRoutes = require('./routes/adminStats');
const chatRoutes = require("./routes/chatRoutes");
const AdminRoutes = require('./routes/adminRoutes');
const productManagement = require('./routes/productManagement');
const RentalManagement = require('./routes/RentalManagement');
const { verifyToken,verifyAdmin, adminCheck } = require('./middleware/auth');
const moment = require('moment');
const PDFDocument = require('pdfkit');

const ratingRoutes = require('./routes/ratings');// const statsRoutes = require('./routes/stats');
// Add to your backend routes file

// const adminRoutes = require('./routes/adminRoutes');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Update Express CORS middleware
app.use(cors({
  origin: [
      "http://localhost:5173",
      "https://justrentit-major-paresh.onrender.com"
    ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Authentication middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

//GOOGLE AUTHENTICATION IMPORT START
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//GOOGLE AUTHENTICATION IMPORT END

const corsOptions = {
  origin: "*", // Or specify your frontend domain
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(express.json());

app.use(cors(corsOptions));
// Set up multer for file upload
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", productRoutes);
app.use("/api/users", userRoutes);
// app.use('/admin/api', adminRoutes);
// Multer setup for file uploapp.use('/api', productRoutes);ads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error: ", err));

// Register User with Profile Photo
app.post("/register", upload.single("profilePhoto"), (req, res) => {
  const { name, email, phone, password } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  UserModel.findOne({ $or: [{ email }, { phone }] })
    .then((user) => {
      if (user) {
        res.json({
          success: false,
          message: "Email or phone number already exists!",
        });
      } else {
        UserModel.create({ name, email, password, phone, profilePhoto })
          .then((newUser) => {
            res.json({ success: true, user: newUser });
          })
          .catch((err) =>
            res.json({ success: false, message: "Error creating user." })
          );
      }
    })
    .catch((err) =>
      res.json({ success: false, message: "Error checking user." })
    );
});

app.post("/api/auth/google",  async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    

    // Add email verification check
    if (!payload.email_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Google email not verified" });
    }

    let user = await UserModel.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email }],
    });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '12h'
    });

    if (!user) {
      user = new UserModel({
        _id: new mongoose.Types.ObjectId(), // Ensure _id is set
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        profilePhoto: payload.picture,
        isVerified: true,
        // Add default values for required fields
        role: "User",
        ratings: 0,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    // Ensure we return the MongoDB _id field
    res.json({
      success: true,
      token, // Ensure token is returned
      user: {
        _id: user._id.toString(), // Convert to string for consistency
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
});

// Add this route before the updateProfile route
app.get('/getUserProfile', async (req, res) => {
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
});

app.post("/updateProfile", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { userId, address, phone } = req.body;

    // Validate user ID first
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateFields = { address, phone };

    // Add profile photo to update if it exists
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

    // Update the user profile
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) {
      return res.json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Create notification after successful update
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

     // Handle duplicate key error
     let errorMessage = "Error updating profile";
     if (err.code === 11000) {
       errorMessage = "Phone number is already registered with another account";
     }

    res.status(500).json({ 
      success: false, 
      message: "Error updating profile" 
    });
  }
});

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        
        if (user.password === password) {
          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '12h'
          });
          res.json({
            success: true,
            token,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              about: user.about,
              profilePhoto: user.profilePhoto
            }
          });
        } else {
          res.json({ success: false, message: "The password is incorrect" });
        }
      } else {
        res.json({ success: false, message: "No record found" });
      }
    })
    .catch((err) => res.json({ success: false, error: err }));
});
// Add Rent Product Route
app.post(
  "/rentproduct/add", verifyToken, // Add JWT middleware first
  upload.array("images", 5),
  (req, res) => {
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
    } = req.body;

    const images = req.files.map((file) => `/uploads/${file.filename}`);
    const isAvailable = available === "true";

    const newProduct = new RentProduct({
      name,
      description,
      rentalPrice,
      category,
      userId: req.user._id, // Get user ID from authenticated user
      images,
      available: isAvailable,
      securityDeposit: req.body.securityDeposit,
      rentalDuration: req.body.rentalDuration,
      condition: req.body.condition,
      isForSale: req.body.isForSale,
      sellingPrice: req.body.sellingPrice,
      location: {
        country,
        state,
        area,
        pincode,
      },
    });

  newProduct
  .save()
  .then(async (product) => {
    // Create notification
    try {
      await Notification.create({
        userId: product.userId,
        message: `Your product "${product.name}" has been listed successfully`,
        type: "product_added",
        metadata: {
          productId: product._id,
        }
      });
    } catch (err) {
      console.error("Notification creation error:", err);
    }

    res.json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error adding product!",
    });
  });
});

app.get('/my-products', verifyToken, async (req, res) => {
  try {
    const products = await RentProduct.find({ owner: req.user._id })
      .populate('category')
      .populate('location');
      
    res.status(200).json({ 
      success: true, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching products' 
    });
  }
});

app.get("/api/my-products",verifyToken, (req, res) => {
  const { userId } = req.query;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or missing User ID" });
  }

  RentProduct.find({ userId })
    .then((products) => {
      if (!products || products.length === 0) {
        return res.json({
          success: false,
          message: "No products found for this user.",
        });
      }
      res.json({ success: true, products });
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching products",
          error: err,
        });
    });
});

app.put(
  "/api/update-product/:productId",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await RentProduct.findById(req.params.productId);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      // Process category data
      let categoryIds = [];
      try {
        const rawCategory =
          typeof req.body.category === "string"
            ? JSON.parse(req.body.category)
            : req.body.category;

        // Handle both ObjectId strings and populated objects
        categoryIds = rawCategory.map((item) => {
          if (mongoose.Types.ObjectId.isValid(item)) return item;
          if (item._id && mongoose.Types.ObjectId.isValid(item._id))
            return item._id;
          throw new Error("Invalid category format");
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid category format: " + error.message,
        });
      }

      // Validate category IDs
      const validCategories = await Category.find({
        _id: { $in: categoryIds },
      });
      if (validCategories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more categories are invalid",
        });
      }

      // Process location
      let location = product.location;
      try {
        if (req.body.location) {
          location =
            typeof req.body.location === "string"
              ? JSON.parse(req.body.location)
              : req.body.location;
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid location format",
        });
      }

      // Build update object
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        rentalPrice: parseFloat(req.body.rentalPrice) || 0,
        securityDeposit: parseFloat(req.body.securityDeposit) || 0,
        rentalDuration: req.body.rentalDuration,
        condition: req.body.condition,
        available: req.body.available === "true",
        isForSale: req.body.isForSale === "true",
        sellingPrice:
          req.body.isForSale === "true"
            ? parseFloat(req.body.sellingPrice) || 0
            : 0,
        category: categoryIds,
        location,
        featured: req.body.featured === "true",
      };
      // Handle image updates
      if (req.files?.length > 0) {
        const newImages = req.files.map((file) => `/uploads/${file.filename}`);
        // Delete old images
        product.images.forEach((image) => {
          const imagePath = path.join(__dirname, image);
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });
        updateData.images = newImages;
      }
      const updatedProduct = await RentProduct.findByIdAndUpdate(
        req.params.productId,
        updateData,
        { new: true }
      ).populate("category");
      try {
        await Notification.create({
          userId: updatedProduct.userId,
          message: `Your product "${updatedProduct.name}" has been updated`,
          type: "product_updated",
          metadata: {
            productId: updatedProduct._id,
          }
        });
      } catch (err) {
        console.error("Notification creation error:", err);
      }
      res.json({ success: true, product: updatedProduct });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Error updating product",
      });
    }
  }
);
// API endpoint to delete a product
app.delete("/api/delete-product/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by ID
    const product = await RentProduct.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Remove images from the server
    product.images.forEach((imagePath) => {
      const fullPath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Remove the file
      }
    });

    // Delete the product from the database
    await RentProduct.findByIdAndDelete(productId);
  // Create notification
  try {
    await Notification.create({
      userId: product.userId,
      message: `Your product "${product.name}" has been deleted successfully.`,
      type: "product_deleted",
      metadata: {
        productId: product._id,
      },
    });
  } catch (notificationError) {
    console.error("Notification creation error:", notificationError);
  }

    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res
      .status(500)
      .json({ success: false, message: "Error deleting product", error: err });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const products = await RentProduct.aggregate([
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "userId",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: "$authorDetails", // Unwind the array to include a single author object
      },
    ]);

    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products", error: err });
  }
});
app.get("/api/products/:id", (req, res) => {
  RentProduct.findById(req.params.id)
    .then((product) => {
      if (product) {
        res.json({ success: true, product });
      } else {
        res.json({ success: false, message: "Product not found" });
      }
    })
    .catch((err) =>
      res.json({
        success: false,
        message: "Error fetching product",
        error: err,
      })
    );
});
// Get single product with owner details
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await RentProduct.findById(req.params.id)
      .populate("category")
      .populate("userId", "name profilePhoto ratings createdAt");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});
// Get all categories
// Server-side categories route
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json(categories); // Direct array response
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});
app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Error adding category" });
  }
});















// Add a new category
app.post("/api/categories", async (req, res) => {
  const { name } = req.body;
  try {
    const category = new Category({ name });
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding category" });
  }
});
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: "Error updating category" });
  }
});

// Delete category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting category" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});








// analytics admin start

// In your backend routes
app.get('/api/analytics/users', async (req, res) => {
  const totalUsers = await UserModel.countDocuments();
  const adminCount = await UserModel.countDocuments({ role: 'Admin' });
  const signups = await UserModel.aggregate([
    { 
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({ totalUsers, adminCount, signups });
});

app.get('/api/analytics/products', async (req, res) => {
  const totalProducts = await RentProduct.countDocuments();
  const availableCount = await RentProduct.countDocuments({ available: true });
  const forSaleCount = await RentProduct.countDocuments({ isForSale: true });
  const categories = await RentProduct.aggregate([
    { $unwind: "$category" },
    {
      $lookup: {
        from: "categories", // Collection where category details are stored
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: "$categoryDetails" },
    {
      $group: {
        _id: "$categoryDetails.name", // Now grouping by category name instead of ID
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.json({ totalProducts, availableCount, forSaleCount, categories });
});

app.get('/api/analytics/rentals', async (req, res) => {
  try {
    const activeRentals = await RentalRequest.countDocuments({
      status: { $in: ['in_transit', 'delivered', 'in_use'] }
    });

    // Aggregation for status distribution
    const statusDistribution = await RentalRequest.aggregate([
      { 
        $group: { _id: "$status", count: { $sum: 1 } } 
      }
    ]);

    const totalRevenueResult = await RentalRequest.aggregate([
      { $match: { status: { $regex: /^completed$/i } } }, // Case-insensitive match
      { 
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$totalPrice" } }  // Convert to number
        }
      }
    ]);
    

    // Extract total revenue value (default to 0 if no data exists)
    const totalRevenueGenerated = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

    res.json({ 
      activeRentals, 
      statusDistribution: statusDistribution.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalRevenue: totalRevenueGenerated // **Total revenue over all time**
    });

  } catch (error) {
    console.error("Error fetching rental analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// analytics admin cloas









// Fetch products by category ID
app.get("/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await RentProduct.find({ category: categoryId }).populate(
      "category"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const {
      categoryId,
      minPrice,
      maxPrice,
      state,
      condition,
      rentalDuration,
      search, // Add search query parameter
    } = req.query;

    const query = { available: true };

    // Add filters
    if (categoryId) query.category = categoryId;
    if (minPrice || maxPrice) {
      query.rentalPrice = {};
      if (minPrice) query.rentalPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.rentalPrice.$lte = parseFloat(maxPrice);
    }
    if (state) query["location.state"] = new RegExp(state, "i");
    if (condition) query.condition = condition;
    if (rentalDuration) query.rentalDuration = rentalDuration;

    // Add text search
    if (search) {
      query.$text = { $search: search };
    }

    const products = await RentProduct.find(query)
      .populate("category")
      .populate("userId", "name email phone profilePhoto"); // Include owner details

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});



app.get('/api/user/:userId',async(req , res )=>{
  try{
    const user = await UserModel.findById(req.params.userId);
    if(!user){
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch(err){
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Error fetching user', error: err });
  }
})



app.get('/api/dashboard-stats', verifyToken, async (req, res) => {
  try {
    // console.log("Decoded Token User:", req.user);

    const userId = req.user._id;
    // Get authenticated user ID

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Run multiple queries in parallel
    const [
      totalProducts,
      rentedProducts,
      pendingRequests,
      completedRentals,
      averageRatingResult,
      estimatedEarningsResult
    ] = await Promise.all([
      RentProduct.countDocuments({ userId }),
      RentProduct.countDocuments({ userId, available: false }),
      RentalRequest.countDocuments({ owner: userId, status: 'pending' }),
      RentalRequest.countDocuments({ owner: userId, status: 'completed' }),
      RentProduct.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            "ratings.averageRating": { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            average: { $avg: "$ratings.averageRating" }
          }
        }
      ]),
      RentalRequest.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
            status: 'completed' // Only count completed rentals
          }
        },
        {
          $lookup: {
            from: "rentproducts",
            localField: "product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$productDetails.rentalPrice" }
          }
        }
      ])
    ]);

    // Extract values safely
    const averageRating = averageRatingResult[0]?.average || 0;
    const estimatedEarnings = estimatedEarningsResult[0]?.totalEarnings || 0;

    res.json({
      success: true,
      stats: {
        totalProducts,
        rentedProducts,
        pendingRequests,
        completedRentals,
        averageRating,
        estimatedEarnings
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});









app.get('/api/admin/generate-report', verifyToken, async (req, res) => {
  try {
    // Verify admin role
    const user = await UserModel.findById(req.user.id);
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch data
    const [users, products, rentals, categories] = await Promise.all([
      UserModel.find(),
      RentProduct.find(),
      RentalRequest.find(),
      Category.find()
    ]);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Website-Report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // **Header Section**
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('Website Analytics Report', { align: 'center' })
      .moveDown(0.5);
    
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm A')}`, { align: 'right' })
      .moveDown(1);

    // **User Statistics**
    doc.fontSize(18).fillColor('#007BFF').text('User Statistics', { underline: true });
    doc.fontSize(12).fillColor('black')
      .text(`Total Users: ${users.length}`)
      .text(`Admins: ${users.filter(u => u.role === 'Admin').length}`)
      .text(`Verified Users: ${users.filter(u => u.isVerified).length}`)
      .moveDown();

    // **Product Analysis**
    doc.fontSize(18).fillColor('#007BFF').text('Product Analysis', { underline: true });
    doc.fontSize(12).fillColor('black')
      .text(`Total Products: ${products.length}`)
      .text(`Verified Products: ${products.filter(p => p.verified).length}`)
      .text(`Featured Products: ${products.filter(p => p.featured).length}`)
      .text(`Total Categories: ${categories.length}`)
      .moveDown();

    // **Rental Activity**
    doc.fontSize(18).fillColor('#007BFF').text('Rental Activity', { underline: true });
    doc.fontSize(12).fillColor('black')
      .text(`Total Rental Requests: ${rentals.length}`)
      .text(`Completed Rentals: ${rentals.filter(r => r.status === 'completed').length}`)
      .text(`Active Rentals: ${rentals.filter(r => ['in_use', 'in_transit'].includes(r.status)).length}`)
      .moveDown();

    // **System Health**
    doc.fontSize(18).fillColor('#007BFF').text('System Health', { underline: true });
    doc.fontSize(12).fillColor('black')
      .text(`Database Size: ${(await mongoose.connection.db.stats()).dataSize} KB`)
      .text(`Active Connections: ${mongoose.connections.length}`)
      .text(`Server Uptime: ${process.uptime().toFixed(2)} seconds`)
      .moveDown();

    // **Recommendations**
    doc.fontSize(18).fillColor('#007BFF').text('Recommendations', { underline: true });
    doc.fontSize(12).fillColor('black')
      .text('Increase user verification rate')
      .text('Optimize product categorization')
      .text('Improve rental completion rate')
      .text('Monitor database growth')
      .moveDown();

    // **Footer**
    doc
      .fontSize(10)
      .fillColor('#555')
      .text('Generated by Admin Panel', { align: 'center' })
      .text(`Date: ${moment().format('MMMM Do YYYY')}`, { align: 'center' })
      .moveDown(2);

    doc.end();
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Report generation failed' });
  }
});













// Rental request creation endpoint
app.post('/api/chatredirect/rental-requests', verifyToken, async (req, res) => {
  try {
    const existingRequest = await RentalRequest.findOne({
      product: req.body.productId,
      requester: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.json(existingRequest);
    }

    const newRequest = new RentalRequest({
      product: req.body.productId,
      owner: req.body.ownerId,
      requester: req.user.id,
      status: 'pending'
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating rental request' });
  }
});















// Serve static files (like images)
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/notifications", notificationRoutes); // Use the notification routes
app.use('/api/rental-requests', rentalRequestsRouter);
app.use("/api", productRoutes);
app.use('/api', userManagementRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/users', AdminRoutes);
app.use('/api', productManagement);
app.use('/api', RentalManagement);
app.use("/api/chat", verifyToken, chatRoutes);
// Ensure dashboard routes are mounted with authentication
// app.use('/dashboard', verifyToken, dashboardRoutes);
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// Add Socket.io logic
io.use(async (socket, next) => {
  
  const token = socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user._id}`);
  
  socket.on('joinChat', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async ({ receiverId, content }) => {
    try {
      const message = new ChatMessage({
        sender: socket.user._id,
        receiver: receiverId,
        content,
        read: false
      });
      
      await message.save();
      
      const populatedMessage = await ChatMessage.findById(message._id)
        .populate('sender', 'name profilePhoto')
        .populate('receiver', 'name profilePhoto');
      
      io.to(receiverId).emit('receiveMessage', populatedMessage);
      socket.emit('receiveMessage', populatedMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });
 

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
