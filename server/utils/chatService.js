const mongoose = require("mongoose");
const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/Users");
const {
  isUserOnline,
  listOnlineUsers
} = require("./chatPresence");

const normalizeId = (value) => String(value);

const buildParticipantKey = (firstUserId, secondUserId) =>
  [normalizeId(firstUserId), normalizeId(secondUserId)].sort().join(":");

const updateConversationUnreadState = (conversation, senderId, receiverId) => {
  const unreadCounts = new Map(
    Object.entries(conversation.unreadCounts?.toObject?.() || conversation.unreadCounts || {})
  );

  unreadCounts.set(normalizeId(senderId), 0);
  unreadCounts.set(
    normalizeId(receiverId),
    Number(unreadCounts.get(normalizeId(receiverId)) || 0) + 1
  );

  conversation.unreadCounts = unreadCounts;
};

const syncConversationMetadata = async (conversation, message, receiverId) => {
  conversation.lastMessage =
    message.messageType === "image"
      ? "Photo"
      : message.deletedForEveryone
        ? "This message was deleted."
        : message.content || "";
  conversation.lastMessageType = message.deletedForEveryone
    ? "system"
    : message.messageType || "text";
  conversation.lastMessageImageUrl = message.imageUrl || "";
  conversation.lastMessageSender = message.sender;
  conversation.lastMessageAt = message.createdAt;

  if (receiverId) {
    updateConversationUnreadState(conversation, message.sender, receiverId);
  }

  await conversation.save();
};

const hydrateMessage = (messageId) =>
  ChatMessage.findById(messageId)
    .populate("sender", "name profilePhoto email")
    .populate("receiver", "name profilePhoto email")
    .populate("deletedBy", "name profilePhoto email");

const ensureConversationForUsers = async (firstUserId, secondUserId) => {
  const participantKey = buildParticipantKey(firstUserId, secondUserId);
  let conversation = await ChatConversation.findOne({ participantKey });

  if (!conversation) {
    conversation = await ChatConversation.create({
      participantKey,
      participants: [firstUserId, secondUserId],
      unreadCounts: {
        [normalizeId(firstUserId)]: 0,
        [normalizeId(secondUserId)]: 0
      }
    });
  }

  await ChatMessage.updateMany(
    {
      conversation: { $exists: false },
      $or: [
        { sender: firstUserId, receiver: secondUserId },
        { sender: secondUserId, receiver: firstUserId }
      ]
    },
    {
      $set: {
        conversation: conversation._id,
        conversationKey: participantKey
      }
    }
  );

  if (!conversation.lastMessageAt) {
    const lastMessage = await ChatMessage.findOne({ conversation: conversation._id })
      .sort({ createdAt: -1 });

    if (lastMessage) {
      conversation.lastMessage =
        lastMessage.messageType === "image" ? "Photo" : lastMessage.content || "";
      conversation.lastMessageType = lastMessage.messageType || "text";
      conversation.lastMessageImageUrl = lastMessage.imageUrl || "";
      conversation.lastMessageSender = lastMessage.sender;
      conversation.lastMessageAt = lastMessage.createdAt;

      const unreadCounts = await ChatMessage.aggregate([
        {
          $match: {
            conversation: conversation._id,
            read: false
          }
        },
        {
          $group: {
            _id: "$receiver",
            count: { $sum: 1 }
          }
        }
      ]);

      const nextUnread = {
        [normalizeId(firstUserId)]: 0,
        [normalizeId(secondUserId)]: 0
      };
      unreadCounts.forEach((entry) => {
        nextUnread[normalizeId(entry._id)] = entry.count;
      });
      conversation.unreadCounts = nextUnread;
      await conversation.save();
    }
  }

  return conversation;
};

const createChatMessage = async ({
  senderId,
  receiverId,
  content = "",
  messageType = "text",
  imageUrl = ""
}) => {
  const conversation = await ensureConversationForUsers(senderId, receiverId);
  const receiverOnline = isUserOnline(receiverId);

  const message = await ChatMessage.create({
    conversation: conversation._id,
    conversationKey: conversation.participantKey,
    sender: senderId,
    receiver: receiverId,
    content: content || "",
    messageType,
    imageUrl: imageUrl || "",
    deliveredAt: receiverOnline ? new Date() : null,
    deliveryStatus: receiverOnline ? "delivered" : "sent"
  });

  await syncConversationMetadata(conversation, message, receiverId);
  return hydrateMessage(message._id);
};

const serializeConversation = async (conversation, currentUserId) => {
  const populated = await ChatConversation.findById(conversation._id)
    .populate("participants", "name profilePhoto email");

  const partner = (populated?.participants || []).find(
    (participant) => normalizeId(participant._id) !== normalizeId(currentUserId)
  );

  return {
    _id: String(populated._id),
    conversationId: String(populated._id),
    participantKey: populated.participantKey,
    partnerId: partner ? String(partner._id) : "",
    name: partner?.name || "Unknown User",
    profilePhoto: partner?.profilePhoto || "",
    email: partner?.email || "",
    lastMessage: populated.lastMessage || "",
    lastMessageAt: populated.lastMessageAt || null,
    unreadCount: Number(
      populated.unreadCounts?.get?.(normalizeId(currentUserId)) ||
      populated.unreadCounts?.[normalizeId(currentUserId)] ||
      0
    ),
    isPinned: (populated.pinnedBy || []).some(
      (userId) => normalizeId(userId) === normalizeId(currentUserId)
    ),
    isArchived: (populated.archivedBy || []).some(
      (userId) => normalizeId(userId) === normalizeId(currentUserId)
    ),
    isOnline: partner ? isUserOnline(partner._id) : false
  };
};

const getConversationListForUser = async (userId) => {
  const conversations = await ChatConversation.find({
    participants: new mongoose.Types.ObjectId(normalizeId(userId))
  }).sort({ lastMessageAt: -1, updatedAt: -1 });

  return Promise.all(
    conversations.map((conversation) => serializeConversation(conversation, userId))
  );
};

const getPaginatedMessages = async ({
  currentUserId,
  partnerId,
  limit = 30,
  cursor
}) => {
  const conversation = await ensureConversationForUsers(currentUserId, partnerId);
  const query = { conversation: conversation._id };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("sender", "name profilePhoto email")
    .populate("receiver", "name profilePhoto email")
    .populate("deletedBy", "name profilePhoto email")
    .lean();

  const hasMore = messages.length > limit;
  const pageItems = hasMore ? messages.slice(0, limit) : messages;
  const ordered = pageItems.reverse();
  const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.createdAt : null;

  const partner = await User.findById(partnerId).select("name profilePhoto email");

  return {
    conversationId: String(conversation._id),
    partner: partner
      ? {
          _id: String(partner._id),
          name: partner.name,
          profilePhoto: partner.profilePhoto || "",
          email: partner.email || "",
          isOnline: isUserOnline(partner._id)
        }
      : null,
    messages: ordered,
    nextCursor
  };
};

const markConversationAsSeen = async ({ currentUserId, partnerId }) => {
  const conversation = await ensureConversationForUsers(currentUserId, partnerId);
  const now = new Date();

  await ChatMessage.updateMany(
    {
      conversation: conversation._id,
      sender: partnerId,
      receiver: currentUserId,
      read: false
    },
    {
      $set: {
        read: true,
        seenAt: now,
        deliveredAt: now,
        deliveryStatus: "seen"
      }
    }
  );

  conversation.unreadCounts = {
    ...(conversation.unreadCounts?.toObject?.() || conversation.unreadCounts || {}),
    [normalizeId(currentUserId)]: 0
  };
  await conversation.save();

  return conversation;
};

const markConversationAsDelivered = async ({ currentUserId, partnerId }) => {
  const conversation = await ensureConversationForUsers(currentUserId, partnerId);
  const now = new Date();

  await ChatMessage.updateMany(
    {
      conversation: conversation._id,
      sender: partnerId,
      receiver: currentUserId,
      deliveredAt: null
    },
    {
      $set: {
        deliveredAt: now,
        deliveryStatus: "delivered"
      }
    }
  );

  return conversation;
};

const softDeleteMessageForEveryone = async ({ messageId, currentUserId }) => {
  const message = await ChatMessage.findOne({
    _id: messageId,
    sender: currentUserId,
    deletedForEveryone: false
  });

  if (!message) return null;

  message.deletedForEveryone = true;
  message.deletedAt = new Date();
  message.deletedBy = currentUserId;
  message.deliveryStatus = message.seenAt
    ? "seen"
    : message.deliveredAt
      ? "delivered"
      : "sent";
  if (message.messageType === "text") {
    message.content = "This message was deleted.";
  }
  await message.save();

  const conversation = await ChatConversation.findById(message.conversation);
  if (conversation && String(conversation.lastMessageAt) === String(message.createdAt)) {
    await syncConversationMetadata(conversation, message);
  }

  return hydrateMessage(message._id);
};

const getSearchableUsers = async ({ currentUserId, query, limit = 10 }) => {
  const trimmedQuery = (query || "").trim();
  const selector = { _id: { $ne: currentUserId } };

  if (trimmedQuery) {
    selector.$or = [
      { name: { $regex: trimmedQuery, $options: "i" } },
      { email: { $regex: trimmedQuery, $options: "i" } },
      { phone: { $regex: trimmedQuery, $options: "i" } }
    ];
  }

  const users = await User.find(selector)
    .select("name profilePhoto email phone")
    .sort({ name: 1 })
    .limit(Math.min(Math.max(Number(limit) || 10, 1), 25));

  return users.map((user) => ({
    _id: String(user._id),
    name: user.name,
    profilePhoto: user.profilePhoto || "",
    email: user.email || "",
    phone: user.phone || "",
    isOnline: isUserOnline(user._id)
  }));
};

const getOnlineStateForUsers = (userIds) => {
  const onlineUsers = listOnlineUsers();
  return userIds.reduce((acc, userId) => {
    acc[normalizeId(userId)] = onlineUsers.has(normalizeId(userId));
    return acc;
  }, {});
};

module.exports = {
  buildParticipantKey,
  createChatMessage,
  ensureConversationForUsers,
  getConversationListForUser,
  getOnlineStateForUsers,
  getPaginatedMessages,
  getSearchableUsers,
  markConversationAsDelivered,
  markConversationAsSeen,
  serializeConversation,
  softDeleteMessageForEveryone
};
