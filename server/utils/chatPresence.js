const activeSocketsByUser = new Map();

const normalizeId = (value) => String(value);

const addUserSocket = (userId, socketId) => {
  const key = normalizeId(userId);
  const sockets = activeSocketsByUser.get(key) || new Set();
  sockets.add(socketId);
  activeSocketsByUser.set(key, sockets);
  return sockets.size;
};

const removeUserSocket = (userId, socketId) => {
  const key = normalizeId(userId);
  const sockets = activeSocketsByUser.get(key);
  if (!sockets) return 0;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    activeSocketsByUser.delete(key);
    return 0;
  }

  activeSocketsByUser.set(key, sockets);
  return sockets.size;
};

const isUserOnline = (userId) => activeSocketsByUser.has(normalizeId(userId));

const listOnlineUsers = () => new Set(activeSocketsByUser.keys());

module.exports = {
  addUserSocket,
  isUserOnline,
  listOnlineUsers,
  removeUserSocket
};
