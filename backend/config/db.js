// config/db.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ Using existing database connection');
        return;
      }

      // Set strictQuery to false to fix the deprecation warning
      mongoose.set('strictQuery', false);

      // Connect to MongoDB
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('✅ MongoDB Connected Successfully');

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Database Connection Failed:', error.message);
      this.isConnected = false;
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('📦 Database disconnected');
    }
  }
}

// Create and export singleton instance
const database = new Database();
module.exports = database;