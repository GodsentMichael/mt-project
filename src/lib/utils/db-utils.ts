import connectDB from "@/lib/db"
import Product from "@/lib/models/Product"
import Category from "@/lib/models/Category"
import Order from "@/lib/models/Order"
import Review from "@/lib/models/Review"

export async function getProducts(
  options: {
    page?: number
    limit?: number
    category?: string
    featured?: boolean
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    minPrice?: number
    maxPrice?: number
  } = {},
) {
  await connectDB()

  const {
    page = 1,
    limit = 12,
    category,
    featured,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    minPrice,
    maxPrice,
  } = options

  const skip = (page - 1) * limit
  const query: any = { status: "ACTIVE" }

  // Apply filters
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category })
    if (categoryDoc) {
      query.categoryId = categoryDoc._id
    }
  }

  if (featured !== undefined) {
    query.featured = featured
  }

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {}
    if (minPrice !== undefined) query.price.$gte = minPrice
    if (maxPrice !== undefined) query.price.$lte = maxPrice
  }

  // Build sort object
  const sort: any = {}
  sort[sortBy] = sortOrder === "asc" ? 1 : -1

  const [products, total] = await Promise.all([
    Product.find(query).populate("categoryId", "name slug").sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getProductBySlug(slug: string) {
  await connectDB()

  const product = await Product.findOne({ slug, status: "ACTIVE" }).populate("categoryId", "name slug").lean()

  if (!product || Array.isArray(product)) return null

  // Get reviews for this product
  const reviews = await Review.find({ productId: (product as any)._id })
    .populate("userId", "name image")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  return {
    ...product,
    reviews,
  }
}

export async function getCategories() {
  await connectDB()

  return Category.find({}).sort({ name: 1 }).lean()
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB()

  return Product.find({ featured: true, status: "ACTIVE" })
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

export async function createOrder(orderData: any) {
  await connectDB()

  // Generate order number
  const orderCount = await Order.countDocuments()
  const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(4, "0")}`

  const order = new Order({
    ...orderData,
    orderNumber,
  })

  return order.save()
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  await connectDB()

  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    Order.find({ userId })
      .populate("items.productId", "name slug images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ userId }),
  ])

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
