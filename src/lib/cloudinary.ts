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
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "auto" as const,
      quality: "auto",
      fetch_format: "auto",
    }

    if (file instanceof File) {
      // Convert File to buffer
      file.arrayBuffer().then((buffer) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error)
            else resolve(result as CloudinaryUploadResult)
          })
          .end(Buffer.from(buffer))
      })
    } else if (typeof file === "string") {
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result as CloudinaryUploadResult)
      })
    } else if (Buffer.isBuffer(file)) {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error)
          else resolve(result as CloudinaryUploadResult)
        })
        .end(file)
    } else {
      reject(new Error("Unsupported file type for uploadToCloudinary"))
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
