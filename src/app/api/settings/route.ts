import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Settings from "@/lib/models/Settings"

export async function GET() {
  try {
    await connectDB()

    // Get public settings (exclude sensitive admin settings)
    let settings = await Settings.findOne({}).select(
      'storeName storeDescription storeEmail storePhone storeAddress currency allowRegistration maintenanceMode'
    )
    
    if (!settings) {
      // Return default public settings if none exist
      settings = {
        storeName: "McTaylor Shop",
        storeDescription: "Your fashion destination for the latest trends",
        storeEmail: "contact@mctaylor.com",
        storePhone: "+1 (555) 123-4567",
        storeAddress: "123 Fashion St, Style City, SC 12345",
        currency: "NGN",
        allowRegistration: true,
        maintenanceMode: false,
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching public settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
