import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Simple validation - you can remove this in production
    if (email !== "admin@mctaylor.com" || password !== "admin123456") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    await connectDB()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = new User({
      email,
      name: name || "McTaylor Admin",
      password: hashedPassword,
      role: "ADMIN",
    })

    await admin.save()

    return NextResponse.json({ 
      message: "Admin user created successfully",
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
