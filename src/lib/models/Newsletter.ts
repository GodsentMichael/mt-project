import mongoose from "mongoose"

export interface INewsletter extends mongoose.Document {
  email: string
  active: boolean
  createdAt: Date
}

const NewsletterSchema = new mongoose.Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Remove duplicate index for email since it's already unique

export default mongoose.models.Newsletter || mongoose.model<INewsletter>("Newsletter", NewsletterSchema)
