import mongoose from "mongoose"

export interface IReview extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  rating: number
  title?: string
  comment: string
  verified: boolean
  helpful: number
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new mongoose.Schema<IReview>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true })
ReviewSchema.index({ productId: 1 })
ReviewSchema.index({ rating: 1 })

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
