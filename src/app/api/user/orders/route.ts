import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/lib/models/Order"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const orders = await Order.find({ userId: session.user.id })
      .populate({
        path: 'items.productId',
        select: 'name images price'
      })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
