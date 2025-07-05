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

    const subscribers = await Newsletter.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Create CSV content
    const csvHeader = "Email,Status,Subscribed Date,Unsubscribed Date\n"
    const csvContent = subscribers.map(subscriber => {
      return [
        subscriber.email,
        subscriber.status,
        new Date(subscriber.createdAt).toLocaleDateString(),
        subscriber.unsubscribedAt ? new Date(subscriber.unsubscribedAt).toLocaleDateString() : ''
      ].join(',')
    }).join('\n')

    const csv = csvHeader + csvContent

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting newsletter subscribers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
