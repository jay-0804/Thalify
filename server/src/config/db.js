import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

let isConnected = false;

// Ensure reliable SRV DNS resolution for MongoDB Atlas on Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use default DNS if setServers is restricted
}

export const connectDB = async () => {
  const uri = env.MONGODB_URI;

  // Check if a real MongoDB Atlas URI is provided
  const isAtlasConfigured = uri && uri.startsWith('mongodb+srv://') && !uri.includes('<') && !uri.includes('>');

  if (isAtlasConfigured) {
    try {
      console.log('\n[MongoDB] Connecting to MongoDB Atlas cluster...');
      const conn = await mongoose.connect(uri, {
        dbName: 'tiffinloop',
        serverSelectionTimeoutMS: 8000,
      });
      isConnected = true;
      console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);

      // Auto-seed Atlas if collections are empty so it's fully populated
      const { seedDataDirectly } = await import('../seed/seedDataHelper.js');
      const { Provider } = await import('../models/Provider.model.js');
      const providerCount = await Provider.countDocuments();
      if (providerCount === 0) {
        console.log('[MongoDB Atlas] Empty database detected. Seeding initial data into Atlas...');
        await seedDataDirectly();
        console.log('✅ [MongoDB Atlas] Database successfully seeded!');
      }

      return conn;
    } catch (error) {
      console.error(`❌ [MongoDB Atlas Error]: ${error.message}`);
      console.log('Falling back to local/in-memory instance so the app stays fully functional...');
    }
  }

  // Try connecting to local MongoDB if configured
  if (uri && !uri.startsWith('mongodb+srv://')) {
    try {
      const conn = await mongoose.connect(uri, {
        dbName: 'tiffinloop',
        serverSelectionTimeoutMS: 2000,
      });
      isConnected = true;
      console.log(`✅ [MongoDB Local] Connected to: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      // Local Mongo not running; proceed to in-memory fallback
    }
  }

  // Automatic In-Memory Dev Fallback: guarantees the app NEVER times out or crashes while user configures Atlas!
  try {
    console.log('\n⚡ [MongoDB] Booting High-Performance In-Memory Mongo Engine for instant zero-config dev...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: { dbName: 'tiffinloop' }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri, { dbName: 'tiffinloop' });
    isConnected = true;
    console.log(`✅ [MongoDB Ready] In-memory database connected. Ready for requests!`);

    // Auto-seed demo data immediately so all kitchens, meals, and users are ready out of the box!
    const { seedDataDirectly } = await import('../seed/seedDataHelper.js');
    await seedDataDirectly();

    return conn;
  } catch (err) {
    console.error('Failed to initialize MongoDB instance:', err.message);
  }
};
