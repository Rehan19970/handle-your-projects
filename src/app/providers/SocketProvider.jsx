import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, getSocket, disconnectSocket } from '../../lib/socket';
import { useAuth } from './AuthProvider';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) {
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('⚠️ No access token found for socket connection');
            return;
        }

        // Connect
        const socketInstance = connectSocket(token);
        setSocket(socketInstance);

        const handleConnect = () => {
            console.log('🔌 Socket connected');
            setIsConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log('❌ Socket disconnected. Reason:', reason);
            setIsConnected(false);
        };

        // ⬇️ NAYA: Token expired hone par reconnect karo
        const handleConnectError = async (err) => {
            console.error('❌ Socket connect error:', err.message);

            if (err.message === 'Token expired' || err.message === 'Invalid token') {
                console.log('🔄 Token expired. Refreshing...');

                try {
                    // Axios interceptor se refresh token use karo
                    const axios = (await import('../../lib/axios')).api;

                    // Refresh endpoint call karo
                    await axios.post('/auth/refresh');

                    const newToken = localStorage.getItem('accessToken');
                    if (newToken && newToken !== token) {
                        console.log('🔄 Reconnecting with new token...');
                        disconnectSocket();
                        const newSocket = connectSocket(newToken);
                        setSocket(newSocket);
                    }
                } catch (refreshErr) {
                    console.error('❌ Token refresh failed:', refreshErr.message);
                    // Logout karo
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                }
            }
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);

        if (socketInstance.connected) {
            setIsConnected(true);
        }

        return () => {
            socketInstance.off('connect', handleConnect);
            socketInstance.off('disconnect', handleDisconnect);
            socketInstance.off('connect_error', handleConnectError);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        return { socket: null, isConnected: false };
    }
    return context;
};