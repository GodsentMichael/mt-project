import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/lib/models/Order"
import Product from "@/lib/models/Product"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [totalRevenue, totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: "PAID" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.countDocuments(),
      Product.countDocuments({ status: "ACTIVE" }),
      User.countDocuments({ role: "USER" }),
    ])

    const stats = {
      revenue: totalRevenue[0]?.total || 0,
      orders: totalOrders,
      products: totalProducts,
      users: totalUsers,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
