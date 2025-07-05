import mongoose from "mongoose"

export interface IWishlist extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  createdAt: Date
}

const WishlistSchema = new mongoose.Schema<IWishlist>(
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
  },
  {
    timestamps: true,
  },
)

WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true })

export default mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema)
