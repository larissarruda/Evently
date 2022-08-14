import mongoose from 'mongoose';

const InviteSchema = new mongoose.Schema({
  event_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Event' },
  user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  accepted: { type: String, default: 'pendente' },
});

const EventSchema = new mongoose.Schema({
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  title: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  date_start: { type: String, default: Date.now().toString() },
  date_end: { type: String, required: true },
  invites: [
    {
      event_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'Event' },
      user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
      accepted: { type: String, default: 'pendente' },
    },
  ],
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  invites: [
    {
      eventId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Event' },
      accepted: { type: String, default: 'pendente' },
    },
  ],
});

export const Invite = mongoose.model('Invite', InviteSchema);
export const User = mongoose.model('User', UserSchema);
export const Event = mongoose.model('Event', EventSchema);
