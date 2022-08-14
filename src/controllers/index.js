import { register, login } from "./auth.js";
import { createEvent, getEventsByUserId, updateEvent, deleteEvent, getEvent, getAllEvents, getEventInvites } from "./event.js";
import { getUser, getUserEvents, getUserEventsById, getUserInvites } from "./user.js";

export {
  register,
  login,
  createEvent,
  getEventsByUserId,
  updateEvent,
  deleteEvent,
  getEvent,
  getAllEvents,
  getEventInvites,
  getUser,
  getUserEvents,
  getUserEventsById,
  getUserInvites,
};
