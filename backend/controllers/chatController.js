import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { normalizeUserPair } from "../utils/chatUtils.js";

// GET /api/chat/conversations
export const listConversationsForUser = async (req, res) => {
  const userId = req.user._id;

  try {
    // Find conversations where user is either side
    const conversations = await Conversation.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA userB")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      conversations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/conversations/:conversationId/messages
export const listMessagesForConversation = async (
  req,
  res
) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({ message: "Not found" });
    }

    const userId = String(req.user._id);
    const userA = String(conversation.userA);
    const userB = String(conversation.userB);

    if (userId !== userA && userId !== userB) {
      return res
        .status(403)
        .json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender recipient")
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chat/messages
// body: { receiverId, content }
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !content) {
    return res.status(400).json({
      message: "receiverId and content are required",
    });
  }

  try {
    const { userA, userB } = normalizeUserPair(
      senderId,
      receiverId
    );

    let conversation = await Conversation.findOne({
      userA,
      userB,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        userA,
        userB,
        messages: [],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      recipient: receiverId,
      content,
    });

    conversation.messages.push(message._id);
    await conversation.save();

    // Attach useful sender/recipient info
    const populated = await Message.findById(message._id)
      .populate("sender recipient")
      .lean();

    // Emit to socket.io if available on req.app.locals.io
    const io = req.app?.locals?.io;
    if (io) {
      // notify receiver (and/or both)
      const payload = {
        conversationId: conversation._id,
        ...populated,
      };

      // Prefer a private event if sockets joined with userId.
      // The socket receiver handler in backend/server.js listens for this event name.
      io.emit("receive_private_message", {
        receiverId,
        ...payload,
      });
    }

    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/notifications
export const listNotifications = async (req, res) => {
  // This backend currently has no Notification model.
  // Return empty list to avoid 404s.
  res.status(200).json({ notifications: [] });
};

// GET /api/chat/notifications/my
export const listMyNotifications = async (req, res) => {
  res.status(200).json({ notifications: [] });
};

