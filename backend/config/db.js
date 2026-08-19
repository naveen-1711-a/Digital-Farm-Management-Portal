const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // ── Auto-reconnect on disconnect ─────────────────────────────────────
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — attempting auto-reconnect...');
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }

    console.error('💥 Max retries reached. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
