import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { Provider } from '../models/Provider.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role, businessName, deliveryAreas, description } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('EMAIL_EXISTS', 'An account with this email already exists');
  }

  // Hash password with 10 salt rounds (Section 24)
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role,
  });

  let providerData = null;
  // If provider, create the associated Provider profile (BR-1)
  if (role === 'provider') {
    const provider = await Provider.create({
      ownerId: user._id,
      businessName,
      deliveryAreas,
      description: description || '',
      contactPhone: phone,
    });
    providerData = provider;
  }

  const token = generateToken(user._id, user.role);

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    providerId: providerData ? providerData._id : null,
    provider: providerData,
  };

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Need passwordHash explicitly since select: false
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw ApiError.invalidCredentials('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw ApiError.invalidCredentials('Invalid email or password');
  }

  const token = generateToken(user._id, user.role);

  let provider = null;
  if (user.role === 'provider') {
    provider = await Provider.findOne({ ownerId: user._id });
  } else if (user.role === 'delivery' && user.providerId) {
    provider = await Provider.findById(user.providerId);
  }

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    providerId: provider ? provider._id : user.providerId,
    provider,
  };

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  let provider = null;
  if (user.role === 'provider') {
    provider = await Provider.findOne({ ownerId: user._id });
  } else if (user.role === 'delivery' && user.providerId) {
    provider = await Provider.findById(user.providerId);
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        providerId: provider ? provider._id : user.providerId,
        provider,
      },
    },
  });
});
