import mongoose from "mongoose"

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  price: number
  total: number
}

export interface IOrder extends mongoose.Document {
  orderNumber: string
  userId: mongoose.Types.ObjectId
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  paymentMethod?: string
  paymentId?: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  billingAddress?: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  items: IOrderItem[]
  notes?: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new mongoose.Schema<IOrderItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
})

const AddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  address1: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String,
})

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: String,
    paymentId: String,
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    billingAddress: AddressSchema,
    items: [OrderItemSchema],
    notes: String,
    trackingNumber: String,
  },
  {
    timestamps: true,
  },
)

OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

let Order: mongoose.Model<IOrder>
try {
  Order = mongoose.model<IOrder>("Order")
} catch {
  Order = mongoose.model<IOrder>("Order", OrderSchema)
}

export default Order
