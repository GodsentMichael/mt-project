import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Newsletter from "@/lib/models/Newsletter"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const [total, active, unsubscribed] = await Promise.all([
      Newsletter.countDocuments({}),
      Newsletter.countDocuments({ status: 'ACTIVE' }),
      Newsletter.countDocuments({ status: 'UNSUBSCRIBED' }),
    ])

    return NextResponse.json({
      total,
      active,
      unsubscribed
    })
  } catch (error) {
    console.error("Error fetching newsletter stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
