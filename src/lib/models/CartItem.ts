import mongoose from "mongoose"

export interface ICartItem extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  quantity: number
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new mongoose.Schema<ICartItem>(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

CartItemSchema.index({ userId: 1, productId: 1 }, { unique: true })

export default mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema)
