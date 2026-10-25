import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  const uri = env.MONGODB_URI;

  if (uri.includes('<password>') || uri.includes('<user>')) {
    console.error('\n=============================================================');
    console.error('⚠️  MONGODB ATLAS CONFIGURATION NOTICE:');
    console.error('It looks like your MONGODB_URI in server/.env still has placeholder text.');
    console.error('Please open server/.env and replace <user> and <password> with your actual MongoDB Atlas database credentials.');
    console.error('=============================================================\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'tiffinloop', // Ensures data is stored in the tiffinloop database even if omitted in connection string
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`\n✅ [MongoDB Atlas] Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);
    return conn;
  } catch (error) {
    console.error('\n❌ [MongoDB Atlas Connection Error]:', error.message);
    console.error('\nTroubleshooting Checklist:');
    console.error('1. Atlas Network Access: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
    console.error('2. Database User: Ensure your Database User exists under "Database Access" and has Read/Write permissions.');
    console.error('3. Special Characters: If your password has special characters like @, #, $, ensure it is URL-encoded or create a password with only alphanumeric characters.');
    console.error('4. server/.env: Check that MONGODB_URI is saved properly.\n');
    process.exit(1);
  }
};
