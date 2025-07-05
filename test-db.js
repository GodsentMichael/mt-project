const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.DATABASE_URL;
console.log('Testing database connection...');
console.log('MONGODB_URI:', MONGODB_URI ? 'Found' : 'Not found');

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('✅ Database connected successfully!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    await TestModel.deleteOne({ name: 'Connection Test' });
    console.log('✅ Test document deleted successfully!');
    
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
