import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

let socket = null;

export const connectSocket = (token) => {
  // ⬇️ Agar socket pehle se connected hai aur token same hai, toh return karo
  if (socket?.connected && socket.auth?.token === token) {
    return socket;
  }

  // ⬇️ Agar purana socket hai par token alag hai, toh disconnect karo
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'], // ⬅️ Dono add karo (reliability)
    reconnection: true,
    reconnectionAttempts: 10, // ⬅️ 5 se 10
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000, // ⬅️ Max 5 sec
    timeout: 20000, // ⬅️ Connection timeout
  });

  // ⬇️ Debug logs
  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};