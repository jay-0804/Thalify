import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  const uri = env.MONGODB_URI;

  if (uri.includes('<password>') || uri.includes('<user>') || uri.includes('127.0.0.1:27017')) {
    console.log('\n=============================================================');
    console.log('📌  MONGODB ATLAS SETUP:');
    console.log('Paste your MongoDB Atlas connection string in server/.env:');
    console.log('MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority');
    console.log('=============================================================\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'tiffinloop',
      serverSelectionTimeoutMS: 4000,
    });

    isConnected = true;
    console.log(`\n✅ [MongoDB] Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`\n⚠️  [MongoDB] Waiting for valid Atlas connection string: ${error.message}`);
    console.log(`   👉 The server is still running on port ${env.PORT}.`);
    console.log(`   👉 Once you update server/.env with your Atlas URI, it will connect automatically.\n`);
    
    // Auto-retry connection every 10 seconds without crashing process
    setTimeout(() => {
      if (!isConnected) connectDB();
    }, 10000);
  }
};
