import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { Provider } from '../models/Provider.model.js';

let io = null;

export const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Handshake authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication token required for WebSocket connection'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
        providerId: user.providerId ? user.providerId.toString() : null,
      };

      // If provider, find providerId
      if (user.role === 'provider') {
        const provider = await Provider.findOne({ ownerId: user._id });
        if (provider) {
          socket.user.providerId = provider._id.toString();
        }
      }

      next();
    } catch (err) {
      next(new Error('Invalid token in WebSocket handshake'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, providerId } = socket.user;

    // Join user room
    socket.join(`user:${id}`);

    // If provider or delivery staff, join provider room
    if (providerId) {
      socket.join(`provider:${providerId}`);
    }

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = () => io;

/**
 * Emit delivery update to customer and provider
 */
export const emitDeliveryUpdate = ({ customerId, providerId, mealId, subscriptionId, date, mealType, status, failureReason, completedAt }) => {
  if (!io) return;
  const payload = {
    mealId,
    subscriptionId,
    date,
    mealType,
    status,
    failureReason,
    completedAt: completedAt || new Date(),
  };

  if (customerId) {
    io.to(`user:${customerId}`).emit('delivery:update', payload);
  }
  if (providerId) {
    io.to(`provider:${providerId}`).emit('delivery:update', payload);
  }
};

/**
 * Emit prep:changed to provider room
 */
export const emitPrepChanged = (providerId, data = {}) => {
  if (!io || !providerId) return;
  io.to(`provider:${providerId}`).emit('prep:changed', data);
};
