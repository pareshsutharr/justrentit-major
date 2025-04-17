const mongoose = require("mongoose");
const ChatMessageSchema = new mongoose.Schema({
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
  imageUrl: String
});

// Add indexes
ChatMessageSchema.index({ sender: 1, receiver: 1 });
ChatMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);