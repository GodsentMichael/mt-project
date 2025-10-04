import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["order", "product", "customer", "newsletter", "review"],
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = models.Notification || model("Notification", NotificationSchema);

export default Notification;
