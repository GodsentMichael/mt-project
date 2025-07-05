import mongoose from "mongoose"

export interface ICategory extends mongoose.Document {
  name: string
  slug: string
  description?: string
  image?: string
  status: 'ACTIVE' | 'INACTIVE'
  parentId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    image: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  },
)

// Remove duplicate index for slug since it's already unique
CategorySchema.index({ parentId: 1 })

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
