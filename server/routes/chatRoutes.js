const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const ChatConversation = require("../models/ChatConversation");
const User = require("../models/Users");
const { verifyToken } = require("../middleware/auth");
const { default: mongoose } = require("mongoose");
const multer = require('multer');
const path = require('path');
const {
  createChatMessage,
  ensureConversationForUsers,
  getConversationListForUser,
  getPaginatedMessages,
  getSearchableUsers,
  markConversationAsDelivered,
  markConversationAsSeen,
  softDeleteMessageForEveryone
} = require("../utils/chatService");
const { isUserOnline } = require("../utils/chatPresence");
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
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const conversations = await getConversationListForUser(req.user._id);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error retrieving conversations" });
  }
});

router.get('/users/search', verifyToken, async (req, res) => {
  try {
    const users = await getSearchableUsers({
      currentUserId: req.user._id,
      query: req.query.q,
      limit: req.query.limit
    });
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Error searching users" });
  }
});

router.get('/thread/:partnerId', verifyToken, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 50);

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }

    const thread = await getPaginatedMessages({
      currentUserId: req.user._id,
      partnerId,
      limit,
      cursor: req.query.cursor
    });

    await markConversationAsDelivered({
      currentUserId: req.user._id,
      partnerId
    });

    res.json(thread);
  } catch (error) {
    console.error('Error fetching paginated thread:', error);
    res.status(500).json({ message: 'Error retrieving chat history' });
  }
});

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
      senderId: sender,
      receiverId: receiver,
      content: req.body.content || '',
      messageType: 'text',
      imageUrl: ''
    };

    if (req.file) {
      const configuredBaseUrl = req.app.get('publicServerUrl');
      const requestBaseUrl = `${req.protocol}://${req.get('host')}`;
      const baseUrl = configuredBaseUrl || requestBaseUrl;
      messageData.messageType = 'image';
      messageData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const savedMessage = await createChatMessage(messageData);
    
    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.to(String(receiver)).emit('receiveMessage', savedMessage);
      io.to(String(sender)).emit('receiveMessage', savedMessage);
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: error.message });
  }
});
router.get('/users/:userId', verifyToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Validate user ID format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
  
      // Verify requested user matches authenticated user
      if (userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      const chatUsers = await getConversationListForUser(userId);
  
      res.json(chatUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.patch('/read/:partnerId', verifyToken, async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner ID format' });
    }

    await markConversationAsSeen({
      currentUserId,
      partnerId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking chat as read:', error);
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
      
          res.json({
            success: true,
            user: {
              ...user.toObject(),
              isOnline: isUserOnline(user._id)
            }
          });
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).json({ success: false, message: "Internal Server Error" });
        }
      });
      // Delete entire chat history between two users
router.delete('/messages/:messageId', verifyToken, async (req, res) => {
  try {
    const message = await softDeleteMessageForEveryone({
      messageId: req.params.messageId,
      currentUserId: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const io = req.app.get('socketio');
    if (io) {
      io.to(String(message.sender._id || message.sender)).emit('messageDeleted', message);
      io.to(String(message.receiver._id || message.receiver)).emit('messageDeleted', message);
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Error deleting message" });
  }
});

router.delete('/:senderId/:receiverId', verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (req.user._id.toString() !== senderId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const conversation = await ensureConversationForUsers(senderId, receiverId);
    await ChatMessage.deleteMany({
      conversation: conversation._id
    });
    await ChatConversation.findByIdAndDelete(conversation._id);

    res.json({ success: true, message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ message: "Error deleting chat history" });
  }
});

// Backward-compatible history route
router.get('/:senderId/:receiverId', verifyToken, async (req, res) => {
    try {
      const { senderId, receiverId } = req.params;
  
      if (req.user._id.toString() !== senderId) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const thread = await getPaginatedMessages({
        currentUserId: senderId,
        partnerId: receiverId,
        limit: 500
      });
  
      res.json(thread.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error retrieving chat history' });
    }
  });

  
module.exports = router;
