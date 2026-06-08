import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // user that starts the conversation
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // user/operator that receives the conversation
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // keep one chat thread between two users
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

// Ensure a single conversation per pair (order-independent)
// We store conversations for both orderings by always querying with min/max at API layer.
conversationSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;

