import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Wishlist from "@/lib/models/Wishlist"
import Product from "@/lib/models/Product"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const wishlist = await Wishlist.find({ userId: session.user.id })
      .populate({
        path: 'productId',
        select: 'name images price discountPrice slug'
      })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("Error fetching user wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await connectDB()

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      userId: session.user.id,
      productId
    })

    if (existingWishlistItem) {
      return NextResponse.json({ error: "Product already in wishlist" }, { status: 409 })
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId: session.user.id,
      productId
    })

    await wishlistItem.save()

    // Return the populated wishlist item
    const populatedItem = await Wishlist.findById(wishlistItem._id)
      .populate({
        path: 'productId',
        select: 'name images price discountPrice slug'
      })
      .lean()

    return NextResponse.json(populatedItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await connectDB()

    const result = await Wishlist.findOneAndDelete({
      userId: session.user.id,
      productId
    })

    if (!result) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
