# TODO - Chat box + routes

- [ ] Inspect current chatbox frontend expectations (socket event names + any REST endpoints used).
- [ ] Add backend Socket.IO private chat handlers (join, private_message, typing/ack if needed).
- [ ] Create REST routes for chat/notifications if the frontend is calling `/api/...` for them.
- [ ] Implement `backend/routs/notificationRoutes.js` (or `messageRoutes.js`) and mount in `backend/app.js`.
- [ ] Implement persistence (optional) via Mongo models for Conversations/Messages.
- [ ] Verify CORS + cookie/token usage for socket auth.
- [ ] Run backend and test chatbox end-to-end.

