import mongoose from "mongoose"

export interface IAddress extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  type: "SHIPPING" | "BILLING"
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
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["SHIPPING", "BILLING"],
      default: "SHIPPING",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    company: String,
    address1: {
      type: String,
      required: true,
    },
    address2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

AddressSchema.index({ userId: 1 })

export default mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)
