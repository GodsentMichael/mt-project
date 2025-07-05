import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
  email: string
  name?: string
  password?: string
  image?: string
  role: "USER" | "ADMIN" | "STAFF"
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    image: String,
    role: {
      type: String,
      enum: ["USER", "ADMIN", "STAFF"],
      default: "USER",
    },
    emailVerified: Date,
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
