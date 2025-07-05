require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function insertCategories() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
    
    // Insert categories directly
    const categoriesData = [
      {
        name: "Women's Fashion",
        slug: "womens-fashion",
        description: "Latest trends in women's clothing",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Men's Fashion",
        slug: "mens-fashion", 
        description: "Stylish men's apparel and accessories",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wedding & Corsets",
        slug: "wedding-corsets",
        description: "Comfortable and fashionable corsets",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with perfect accessories",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const collection = mongoose.connection.db.collection('categories');
    
    // Clear existing categories first
    await collection.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert new categories
    const result = await collection.insertMany(categoriesData);
    console.log('Inserted categories:', result.insertedCount);
    
    // Verify insertion
    const categories = await collection.find({}).toArray();
    console.log('Verification - Categories in DB:', categories.length);
    console.log('Categories:', categories);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

insertCategories();
