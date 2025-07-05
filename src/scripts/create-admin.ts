import dotenv from "dotenv"
import connectDB from "../lib/db"
import User from "../lib/models/User"
import bcrypt from "bcryptjs"

// Load environment variables
dotenv.config()

async function createAdmin() {
  try {
    await connectDB()

    const adminEmail = "mctaylor247@gmail.com"
    const adminPassword = "admin@123456" 

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })
    if (existingAdmin) {
      console.log("Admin user already exists!")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const admin = new User({
      email: adminEmail,
      name: "McTaylor Admin",
      password: hashedPassword,
      role: "ADMIN",
    })

    await admin.save()

    console.log("Admin user created successfully!")
    console.log("Email:", adminEmail)
    console.log("Password:", adminPassword)
    console.log("Please change the password after first login!")

  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

createAdmin()
