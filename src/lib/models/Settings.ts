import mongoose from "mongoose"

export interface ISettings extends mongoose.Document {
  storeName: string
  storeDescription: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  taxRate: number
  shippingRate: number
  freeShippingThreshold: number
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  createdAt: Date
  updatedAt: Date
}

const SettingsSchema = new mongoose.Schema<ISettings>(
  {
    storeName: {
      type: String,
      required: true,
      default: "McTaylor Shop",
    },
    storeDescription: {
      type: String,
      default: "Your fashion destination for the latest trends",
    },
    storeEmail: {
      type: String,
      required: true,
      default: "contact@mctaylor.com",
    },
    storePhone: {
      type: String,
      default: "+1 (555) 123-4567",
    },
    storeAddress: {
      type: String,
      default: "123 Fashion St, Style City, SC 12345",
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'NGN'],
      default: "NGN",
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    shippingRate: {
      type: Number,
      default: 1500,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 25000,
      min: 0,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    requireEmailVerification: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema)
