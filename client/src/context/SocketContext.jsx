import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef({ delivery: new Set(), prep: new Set() });

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected to server as', user?.role);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    });

    // Real-time delivery update listener
    newSocket.on('delivery:update', (data) => {
      console.log('[Socket] delivery:update received', data);
      if (data.status === 'delivered') {
        toast.success(`🍱 Meal Delivered: ${data.mealType} on ${data.date}!`, {
          icon: '✨',
          duration: 5000,
        });
      } else if (data.status === 'failed') {
        toast.error(`⚠️ Meal Delivery Failed (${data.failureReason || 'Issue'})`, {
          duration: 5000,
        });
      }

      // Notify registered callbacks
      listenersRef.current.delivery.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(e);
        }
      });
    });

    // Real-time kitchen prep change listener
    newSocket.on('prep:changed', (data) => {
      console.log('[Socket] prep:changed received', data);
      listenersRef.current.prep.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(e);
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const onDeliveryUpdate = (callback) => {
    listenersRef.current.delivery.add(callback);
    return () => listenersRef.current.delivery.delete(callback);
  };

  const onPrepChanged = (callback) => {
    listenersRef.current.prep.add(callback);
    return () => listenersRef.current.prep.delete(callback);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, onDeliveryUpdate, onPrepChanged }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
