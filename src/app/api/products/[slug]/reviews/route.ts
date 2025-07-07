import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Review from "@/lib/models/Review"
import Product from "@/lib/models/Product"
import Order from "@/lib/models/Order"

// GET /api/products/[slug]/reviews - Get reviews for a product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Find product by slug
    const { slug } = await context.params
    const product = await Product.findOne({ slug })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const reviews = await Review.find({ productId: product._id })
      .populate({
        path: 'userId',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalReviews = await Review.countDocuments({ productId: product._id })
    const totalPages = Math.ceil(totalReviews / limit)

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ])

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1
      const stat = ratingStats.find(s => s._id === rating)
      return {
        rating,
        count: stat ? stat.count : 0,
        percentage: totalReviews > 0 ? ((stat ? stat.count : 0) / totalReviews) * 100 : 0
      }
    }).reverse()

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalPages,
        totalReviews
      },
      ratingDistribution
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/products/[slug]/reviews - Add a review for a product
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, title, comment } = await request.json()

    if (!rating || !comment) {
      return NextResponse.json(
        { error: "Rating and comment are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be less than 1000 characters" },
        { status: 400 }
      )
    }

    if (title && title.length > 100) {
      return NextResponse.json(
        { error: "Title must be less than 100 characters" },
        { status: 400 }
      )
    }

    await connectDB()

    // Find product by slug
    const { slug } = await context.params
    const product = await Product.findOne({ slug })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      userId: session.user.id,
      productId: product._id
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      )
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await Order.findOne({
      userId: session.user.id,
      "items.productId": product._id,
      status: { $in: ["DELIVERED", "COMPLETED"] }
    })

    // Create review
    const review = new Review({
      userId: session.user.id,
      productId: product._id,
      rating,
      title: title || "",
      comment,
      verified: !!hasPurchased
    })

    await review.save()

    // Update product rating statistics
    const allReviews = await Review.find({ productId: product._id })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    
    await Product.findByIdAndUpdate(product._id, {
      averageRating: avgRating,
      reviewCount: allReviews.length
    })

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'userId',
        select: 'name email'
      })
      .lean()

    return NextResponse.json(populatedReview, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
