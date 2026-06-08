import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  listConversationsForUser,
  listMessagesForConversation,
  sendMessage,
  listNotifications,
  listMyNotifications,
} from "../controllers/chatController.js";

const router = express.Router();

router.get(
  "/conversations",
  authMiddleware,
  listConversationsForUser
);

router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  listMessagesForConversation
);

router.post(
  "/messages",
  authMiddleware,
  sendMessage
);

// Notification compatibility endpoints (empty until you add persistence)
router.get("/notifications", authMiddleware, listNotifications);
router.get(
  "/notifications/my",
  authMiddleware,
  listMyNotifications
);

export default router;

