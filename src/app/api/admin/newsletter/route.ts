import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Newsletter from "@/lib/models/Newsletter"
import Notification from "@/lib/models/Notification"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit
    const query: any = {}

    if (search) {
      query.email = { $regex: search, $options: 'i' }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const [subscribers, total] = await Promise.all([
      Newsletter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Newsletter.countDocuments(query)
    ])

    return NextResponse.json({
      subscribers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    })
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Subscribe to newsletter (public endpoint)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email })
    if (existingSubscriber) {
      return NextResponse.json({ error: "Email already subscribed" }, { status: 400 })
    }

    const subscriber = new Newsletter({
      email,
      subscribedAt: new Date(),
    })

    await subscriber.save()

    // Create a notification for the new newsletter subscription
    const notification = new Notification({
      type: "newsletter",
      message: `New newsletter subscription: ${email}`,
      link: `/admin/newsletter`,
    })

    await notification.save()

    return NextResponse.json({ message: "Successfully subscribed to newsletter" }, { status: 201 })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
