import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Category from '../src/lib/models/Category'

dotenv.config({ path: '.env.local' })

async function checkCategories() {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    console.log('Connected to MongoDB')

    const categories = await Category.find({})
    console.log('Total categories in DB:', categories.length)
    console.log('Categories:', categories)

    const activeCategories = await Category.find({ status: 'ACTIVE' })
    console.log('Active categories:', activeCategories.length)
    console.log('Active categories data:', activeCategories)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkCategories()
