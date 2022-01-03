import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  eventId: { type: mongoose.SchemaTypes.ObjectId, ref: "Event" },
  accepted: String,
});

const EventSchema = new mongoose.Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  title: { type: String, required: true, unique: true },
  start: { type: String, default: Date.now.toString() },
  end: {type: String, required: true },
  description: { type: String, required: false },
  guests: [
    {
      userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
      accepted: { type: String, default: "pendente" },
    },
  ],
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  notifications: [NotificationSchema],
});
export const Notification = mongoose.model("Notification", NotificationSchema);
export const User = mongoose.model("User", UserSchema);
export const Event = mongoose.model("Event", EventSchema);
