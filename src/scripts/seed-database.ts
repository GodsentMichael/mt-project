const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/ecommerce"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    console.log("🌱 Seeding database...")

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    await db.collection("users").insertOne({
      email: "admin@shopease.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create categories
    const categories = [
      {
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets and electronic devices",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Fashion",
        slug: "fashion",
        description: "Trendy clothing and accessories",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Everything for your home and garden",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sports",
        slug: "sports",
        description: "Sports equipment and fitness gear",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const insertedCategories = await db.collection("categories").insertMany(categories)
    const categoryIds = Object.values(insertedCategories.insertedIds)

    // Create sample products
    const products = [
      {
        name: "Wireless Bluetooth Headphones",
        slug: "wireless-bluetooth-headphones",
        description: "Premium quality wireless headphones with noise cancellation and long battery life.",
        price: 99.99,
        comparePrice: 129.99,
        sku: "WBH-001",
        stock: 50,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500",
        ],
        featured: true,
        status: "ACTIVE",
        categoryId: categoryIds[0],
        variants: [],
        metaTitle: "Wireless Bluetooth Headphones - Premium Audio",
        metaDescription: "Experience premium audio quality with our wireless Bluetooth headphones.",
        averageRating: 4.5,
        reviewCount: 128,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Smart Fitness Watch",
        slug: "smart-fitness-watch",
        description: "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.",
        price: 199.99,
        comparePrice: 249.99,
        sku: "SFW-002",
        stock: 30,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
        ],
        featured: true,
        status: "ACTIVE",
        categoryId: categoryIds[0],
        variants: [
          { name: "Color", value: "Black", price: 199.99, stock: 15 },
          { name: "Color", value: "Silver", price: 199.99, stock: 15 },
        ],
        metaTitle: "Smart Fitness Watch - Track Your Health",
        metaDescription: "Advanced fitness tracking with heart rate monitoring and GPS.",
        averageRating: 4.3,
        reviewCount: 89,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Casual Cotton T-Shirt",
        slug: "casual-cotton-t-shirt",
        description: "Comfortable and stylish cotton t-shirt perfect for everyday wear.",
        price: 24.99,
        comparePrice: 34.99,
        sku: "CCT-003",
        stock: 100,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
        ],
        featured: false,
        status: "ACTIVE",
        categoryId: categoryIds[1],
        variants: [
          { name: "Size", value: "S", stock: 25 },
          { name: "Size", value: "M", stock: 30 },
          { name: "Size", value: "L", stock: 25 },
          { name: "Size", value: "XL", stock: 20 },
        ],
        metaTitle: "Casual Cotton T-Shirt - Comfortable Daily Wear",
        metaDescription: "Soft, comfortable cotton t-shirt for everyday casual wear.",
        averageRating: 4.2,
        reviewCount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("products").insertMany(products)

    console.log("✅ Database seeded successfully!")
    console.log("👤 Admin user created: admin@shopease.com / admin123")
    console.log(`📦 Created ${categories.length} categories`)
    console.log(`🛍️ Created ${products.length} products`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
