// Socket.IO配置
export const socketOptions = {
  withCredentials: true,
  transports: ['polling', 'websocket'],
  path: '/socket.io',
  secure: true
};
