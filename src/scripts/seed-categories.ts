import dotenv from "dotenv"
import path from "path"
import connectDB from "../lib/db"
import Category from "../lib/models/Category"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function seedCategories() {
  try {
    await connectDB()

    const categories = [
       {
          name: "Women's Fashion",
          slug: "womens-fashion",
          description: "Latest trends in women's clothing",
          status: "ACTIVE"
        },
        {
          name: "Men's Fashion",
          slug: "mens-fashion", 
          description: "Stylish men's apparel and accessories",
          status: "ACTIVE"
        },
        {
          name: "Wedding & Corsets",
          slug: "wedding-corsets",
          description: "Comfortable and fashionable corsets",
          status: "ACTIVE"
        },
        {
          name: "Accessories",
          slug: "accessories",
          description: "Complete your look with perfect accessories",
          status: "ACTIVE"
        },
        {
          name: "Kiddies",
          slug: "kiddies",
          description: "Style your kids with perfect kids wears",
          status: "ACTIVE"
        },
        {
          name: "Shoes & Footwear",
          slug: "shoes-footwear",
          description: "Comfortable and fashionable footwear",
          status: "ACTIVE"
        },
        {
          name: "Jewelry",
          slug: "jewelry",
          description: "Elegant jewelry for every occasion",
          status: "ACTIVE"
        },
        {
          name: "Beauty & Cosmetics",
          slug: "beauty-cosmetics",
          description: "Enhance your beauty with our cosmetics",
          status: "ACTIVE"
        },
      {
        name: "Bags & Luggage",
        slug: "bags-luggage",
        description: "Stylish bags for every occasion",
        status: "ACTIVE"
      }
    ]

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug })
      if (!existingCategory) {
        const category = new Category(categoryData)
        await category.save()
        console.log(`Created category: ${categoryData.name}`)
      } else {
        console.log(`Category already exists: ${categoryData.name}`)
      }
    }

    console.log("Categories seeded successfully!")

  } catch (error) {
    console.error("Error seeding categories:", error)
  }
}

seedCategories()
