import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const customer = await User.findById(id)
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Prevent deletion of admin users
    if (customer.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
