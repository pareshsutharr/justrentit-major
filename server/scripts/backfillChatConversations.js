const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ChatMessage = require("../models/ChatMessage");
const { ensureConversationForUsers } = require("../utils/chatService");

dotenv.config();

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  const groupedPairs = await ChatMessage.aggregate([
    {
      $project: {
        sender: 1,
        receiver: 1,
        pair: {
          $cond: [
            { $lt: ["$sender", "$receiver"] },
            ["$sender", "$receiver"],
            ["$receiver", "$sender"]
          ]
        }
      }
    },
    {
      $group: {
        _id: "$pair"
      }
    }
  ]);

  for (const entry of groupedPairs) {
    const [firstUserId, secondUserId] = entry._id;
    await ensureConversationForUsers(firstUserId, secondUserId);
  }

  await mongoose.disconnect();
  console.log(`Backfilled ${groupedPairs.length} chat conversation(s).`);
};

run().catch(async (error) => {
  console.error("Chat conversation backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
