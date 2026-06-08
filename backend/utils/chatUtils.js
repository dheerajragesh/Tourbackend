export function normalizeUserPair(userId1, userId2) {
  const a = String(userId1);
  const b = String(userId2);
  return a < b ? { userA: a, userB: b } : { userA: b, userB: a };
}

