import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")
    
    // Check Cloudinary environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    
    console.log("Cloudinary config:", {
      cloudName: cloudName ? "✓" : "✗",
      apiKey: apiKey ? "✓" : "✗", 
      apiSecret: apiSecret ? "✓" : "✗"
    })
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary environment variables")
      return NextResponse.json({ 
        error: "Server configuration error - missing Cloudinary credentials" 
      }, { status: 500 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const folder = data.get('folder') as string || 'products'

    console.log("File received:", file ? `${file.name} (${file.size} bytes)` : "No file")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type)
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (4MB max for Vercel serverless)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      console.error("File too large:", file.size)
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    console.log("Starting Cloudinary upload...")
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, folder)
    
    console.log("Cloudinary upload successful:", result.public_id)

    // Return Cloudinary URL
    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: "Failed to upload file",
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : "Unknown error" : undefined
    }, { status: 500 })
  }
}
