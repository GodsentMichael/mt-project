require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
    console.log('Using database URL:', dbUrl ? 'Found' : 'Not found');
    
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB successfully');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
    // Try to find categories without schema
    const categoriesCollection = mongoose.connection.db.collection('categories');
    const categories = await categoriesCollection.find({}).toArray();
    console.log('Categories count:', categories.length);
    console.log('First few categories:', categories.slice(0, 3));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testConnection();
