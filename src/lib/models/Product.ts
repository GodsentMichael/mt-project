import mongoose from "mongoose"

export interface IProductVariant {
  name: string
  value: string
  price?: number
  stock: number
  sku?: string
  image?: string
}

export interface IProduct extends mongoose.Document {
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  sku?: string
  stock: number
  images: string[]
  featured: boolean
  status: "ACTIVE" | "INACTIVE" | "DRAFT"
  categoryId: mongoose.Types.ObjectId
  variants: IProductVariant[]
  metaTitle?: string
  metaDescription?: string
  averageRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

const ProductVariantSchema = new mongoose.Schema<IProductVariant>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  price: Number,
  stock: { type: Number, default: 0 },
  sku: String,
  image: String,
})

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DRAFT"],
      default: "ACTIVE",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    variants: [ProductVariantSchema],
    metaTitle: String,
    metaDescription: String,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Remove duplicate index for slug since it's already unique
ProductSchema.index({ categoryId: 1 })
ProductSchema.index({ featured: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
