import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiffinloop',
  JWT_SECRET: process.env.JWT_SECRET || 'tiffinloop_secret_dev_key_super_secure_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  TZ: process.env.TZ || 'Asia/Kolkata',
};
