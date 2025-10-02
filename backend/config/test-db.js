const mongoose = require('mongoose');

class TestDatabase {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      // Use a test database - you can change this to your preferred test DB
      const testDbUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/prescription_test_db';
      
      await mongoose.connect(testDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      this.connection = mongoose.connection;
      console.log('✅ Test MongoDB Connected Successfully');

    } catch (error) {
      console.error('❌ Test Database Connection Failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('📦 Test Database disconnected');
    }
  }

  async clearDatabase() {
    if (!this.isConnected) return;

    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
}

// Create and export singleton instance
const testDatabase = new TestDatabase();
module.exports = testDatabase;