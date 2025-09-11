import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

export async function uploadToCloudinary(
  file: File | Buffer | string,
  folder = "ecommerce",
): Promise<CloudinaryUploadResult> {
  return new Promise(async (resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "auto" as const,
      quality: "auto",
      fetch_format: "auto",
      timeout: 30000, // 30 second timeout
    }

    try {
      if (file instanceof File) {
        // Convert File to buffer
        const buffer = await file.arrayBuffer()
        const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`
        
        cloudinary.uploader.upload(base64, uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`))
          } else {
            resolve(result as CloudinaryUploadResult)
          }
        })
      } else if (typeof file === "string") {
        cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`))
          } else {
            resolve(result as CloudinaryUploadResult)
          }
        })
      } else if (Buffer.isBuffer(file)) {
        const base64 = `data:image/jpeg;base64,${file.toString('base64')}`
        cloudinary.uploader.upload(base64, uploadOptions, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`))
          } else {
            resolve(result as CloudinaryUploadResult)
          }
        })
      } else {
        reject(new Error("Unsupported file type for uploadToCloudinary"))
      }
    } catch (err) {
      console.error("File processing error:", err)
      reject(new Error(`File processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`))
    }
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export function getCloudinaryUrl(
  publicId: string,
  transformations?: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  },
): string {
  if (!transformations) {
    return cloudinary.url(publicId)
  }

  return cloudinary.url(publicId, {
    transformation: [transformations],
  })
}

export default cloudinary
