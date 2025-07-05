import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Wishlist from "@/lib/models/Wishlist"

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
        select: 'name images price discountPrice'
      })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("Error fetching user wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
