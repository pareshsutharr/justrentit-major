const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/Users");
const { verifyToken } = require("../middleware/auth");
const { default: mongoose } = require("mongoose");
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  }
});
// Add this error handling middleware at the end of your routes
router.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Something broke!' });
});
// Get chat history between two users
// In chatRoutes.js
// Add validation for chat history endpoint
router.get('/:senderId/:receiverId', verifyToken, async (req, res) => {
    try {
      const { senderId, receiverId } = req.params;
  
      // Validate both IDs
      if (req.user._id.toString() !== senderId) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    
  
      const messages = await ChatMessage.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      })
      .sort({ createdAt: 1 })
      .lean();
  
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error retrieving chat history' });
    }
  });

// Get all users (except current user)
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password -googleId -createdAt -updatedAt -__v');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});// Send a new message

// router.post("/", async (req, res) => {
//   const { sender, receiver, content } = req.body;

//   if (!sender || !receiver || !content) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     const newMessage = new ChatMessage({
//       sender,
//       receiver,
//       content,
//     });

//     const savedMessage = await newMessage.save();
//     res.status(201).json(savedMessage);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.post("/", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.user._id; // Get from authenticated user

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver is required' });
    }

    const messageData = {
      sender,
      receiver,
      content: req.body.content || '',
      messageType: 'text'
    };

    if (req.file) {
      messageData.messageType = 'image';
      messageData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const newMessage = new ChatMessage(messageData);
    const savedMessage = await newMessage.save();
    
    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(receiver).emit('newMessage', savedMessage);
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: error.message });
  }
});
// Get users that the current user has chatted with
// Add verifyToken middleware to route
router.get('/users/:userId', verifyToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Validate user ID format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
  
      // Verify requested user matches authenticated user
      if (userId !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      // Fixed aggregation pipeline
      const chatUsers = await ChatMessage.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(userId) },
              { receiver: new mongoose.Types.ObjectId(userId) }
            ]
          }
        },
        {
          $group: {
            _id: null,
            users: {  // Changed from 'User' to 'users'
              $addToSet: {
                $cond: [
                  { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                  "$receiver",
                  "$sender"
                ]
              }
            }
          }
        },
        { $unwind: "$users" },
        { $group: { _id: "$users" } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: "$user._id",
            name: "$user.name",
            profilePhoto: "$user.profilePhoto",
            email: "$user.email"
          }
        }
      ]);
  
      res.json(chatUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
    router.get("/:id", verifyToken, async (req, res) => {
        try {
          const userId = req.params.id;
      
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID" });
          }
      
          const user = await User.findById(userId, "-password -googleId");
          
          if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
          }
      
          res.json({ success: true, user });
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      });
      // Delete entire chat history between two users
router.delete('/:senderId/:receiverId', verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Ensure the user is authorized to delete the chat
    if (req.user._id.toString() !== senderId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Delete messages between these users
    await ChatMessage.deleteMany({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    res.json({ success: true, message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ message: "Error deleting chat history" });
  }
});

  
module.exports = router;