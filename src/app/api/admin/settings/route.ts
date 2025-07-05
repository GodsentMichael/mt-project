import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Settings from "@/lib/models/Settings"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get settings from database or create default if none exist
    let settings = await Settings.findOne({})
    
    if (!settings) {
      settings = new Settings({})
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const settingsData = await request.json()

    // Update or create settings
    let settings = await Settings.findOne({})
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, settingsData)
      await settings.save()
    } else {
      // Create new settings
      settings = new Settings(settingsData)
      await settings.save()
    }

    return NextResponse.json({ message: "Settings saved successfully", settings })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
