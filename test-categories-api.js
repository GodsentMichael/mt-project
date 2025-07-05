require('dotenv').config({ path: '.env.local' });

// Test the categories API route directly
const { NextResponse } = require('next/server');

async function testCategoriesAPI() {
  try {
    // Import the GET function from the route
    const connectDB = require('./src/lib/db.ts').default;
    const Category = require('./src/lib/models/Category.ts').default;
    
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');
    
    const categories = await Category.find({ status: 'ACTIVE' })
      .select('name slug _id')
      .sort({ name: 1 })
      .lean();

    console.log('Categories found:', categories.length);
    console.log('Categories data:', categories);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCategoriesAPI();
