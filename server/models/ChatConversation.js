const mongoose = require("mongoose");

const ChatConversationSchema = new mongoose.Schema(
  {
    participantKey: { type: String, required: true, unique: true, index: true },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    type: {
      type: String,
      enum: ["direct"],
      default: "direct"
    },
    lastMessage: { type: String, default: "" },
    lastMessageType: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text"
    },
    lastMessageImageUrl: { type: String, default: "" },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: null },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    },
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

ChatConversationSchema.index({ participants: 1 });
ChatConversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ChatConversation", ChatConversationSchema);
