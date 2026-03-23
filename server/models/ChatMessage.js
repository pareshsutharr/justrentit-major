const mongoose = require("mongoose");
const ChatMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "ChatConversation" },
  conversationKey: { type: String, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { 
    type: String, 
    required: function() { return this.messageType === 'text'; } 
  },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  imageUrl: String,
  deliveredAt: { type: Date, default: null },
  seenAt: { type: Date, default: null },
  deliveryStatus: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },
  deletedForEveryone: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});

// Add indexes
ChatMessageSchema.index({ sender: 1, receiver: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
