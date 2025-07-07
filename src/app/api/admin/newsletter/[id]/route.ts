import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Newsletter from "@/lib/models/Newsletter"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { status } = await request.json()
    
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const updateData: any = { status }
    if (status === 'UNSUBSCRIBED') {
      updateData.unsubscribedAt = new Date()
    }

    const { id } = await context.params
    const subscriber = await Newsletter.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
    }

    return NextResponse.json(subscriber)
  } catch (error) {
    console.error("Error updating subscriber:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id } = await context.params
    const subscriber = await Newsletter.findByIdAndDelete(id)

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Subscriber deleted successfully" })
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
