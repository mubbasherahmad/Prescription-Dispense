const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const testUtils = {
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    // Use a consistent ID that matches the test server
    const userId = new mongoose.Types.ObjectId('000000000000000000000001');
    return await User.create({
      _id: userId,
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'user',
      ...userData
    });
  },

  createTestDrug: async (drugData = {}) => {
    const Drug = require('../models/Drug');
    return await Drug.create({
      medicineName: 'Test Drug',
      medicineId: `TEST${Date.now()}`,
      groupName: 'Test Group',
      stock: 100,
      createdBy: new mongoose.Types.ObjectId('000000000000000000000001'), // Use consistent ID
      ...drugData
    });
  }
};

module.exports = testUtils;