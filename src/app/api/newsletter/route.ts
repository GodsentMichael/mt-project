import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Newsletter from "@/lib/models/Newsletter"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    // Validate email
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() })
    
    if (existingSubscription) {
      if (existingSubscription.active) {
        return NextResponse.json({ error: "This email is already subscribed" }, { status: 400 })
      } else {
        // Reactivate existing subscription
        existingSubscription.active = true
        await existingSubscription.save()
        return NextResponse.json({ message: "Successfully resubscribed!" }, { status: 200 })
      }
    }

    // Create new subscription
    const newSubscription = new Newsletter({
      email: email.toLowerCase(),
      active: true,
    })

    await newSubscription.save()

    return NextResponse.json({ message: "Successfully subscribed!" }, { status: 201 })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
