require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const categories = await Category.find({});
    console.log('All categories count:', categories.length);
    console.log('All categories:', categories);
    
    const activeCategories = await Category.find({ status: 'ACTIVE' });
    console.log('Active categories count:', activeCategories.length);
    console.log('Active categories:', activeCategories);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
