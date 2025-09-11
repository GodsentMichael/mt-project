import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    cloudinary_configured: {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    },
    node_env: process.env.NODE_ENV,
  })
}