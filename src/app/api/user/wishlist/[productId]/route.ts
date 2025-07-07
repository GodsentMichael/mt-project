import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Wishlist from "@/lib/models/Wishlist"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await context.params

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await connectDB()

    console.log(`Deleting wishlist item for user ${session.user.id}, product ${productId}`)

    const result = await Wishlist.findOneAndDelete({
      userId: session.user.id,
      productId
    })

    if (!result) {
      console.log(`Wishlist item not found for user ${session.user.id}, product ${productId}`)
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 })
    }

    console.log(`Successfully deleted wishlist item:`, result)
    return NextResponse.json({ 
      message: "Item removed from wishlist",
      deletedItem: result 
    })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
