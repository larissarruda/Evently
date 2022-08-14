import { Event, User } from "../models/index.js";

const inviteUser = async (userId, eventId) => {
  console.log("UserId: ", userId);
  try {
    const invite = { event_id: eventId, user_id: userId, accepted: "pendente" };
    await Event.findOneAndUpdate({ _id: eventId }, { $push: { invites: invite } });
    await User.findOneAndUpdate({ _id: userId }, { $push: { invites: invite } });
    return invite;
  } catch (err) {
    console.log(err);
    return null;
  }
};

/** Recebe parâmetros e cria um evento */
export async function createEvent(req, res) {
  try {
    if (await Event.findOne({ author: req.user._id, title: req.body.title }))
      return res.json({
        status: "error",
        error: "Evento com mesmo título já existe",
      });
    const event = new Event({ ...req.body, author: req.user._id, invites: [] });
      if (req.body.invites) {
        event.invites = await Promise.all(await req.body.invites.map(invite => inviteUser(invite, event._id)));
        } 
    await event.save();
    return res.status(201).json(event);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}
/** Recebe id de um usuário e retorna todos eventos dele */
export async function getEventsByUserId(req, res) {
  try {
    if (!(await User.findOne({ _id: req.params.id }))) return res.status(404).json({ status: "error", error: "Usuário não encontrado" });

    const userEventsById = await Event.find({ author: req.params.id });
    return userEventsById ? res.status(200).json(userEventsById) : res.status(404).json({ status: "error", error: "Usuário não possui eventos" });
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}

/** Recebe id de um evento e dados que serão alterados  */
export async function updateEvent(req, res) {
  try {
    const event = await Event.findOne({ _id: req.params.id });
    if (!event) return res.status(404).json({ status: "error", error: "Evento não encontrado" });
    if (req.body.invites) {
      console.log(req.body.invites)
      event.invites = await Promise.all(await req.body.invites.map(invite => inviteUser(invite, event._id)));
      } 
    await event.save();
    await Event.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });
    await event.save();
    const newEvent = await Event.findOne({ _id: req.params.id });
    return res.status(201).json(newEvent);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}
/** Recebe id de um evento e o deleta  */
export async function deleteEvent(req, res) {
  try {
    await Event.findOneAndDelete({ _id: req.params.id });
    return res.sendStatus(204);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}
/** Recebe id de um evento e retorna dados do evento */
export async function getEvent(req, res) {
  try {
    const event = await Event.findOne({ _id: req.params.id });
    if (!event) return res.status(404).json({ status: "error", error: "Evento não encontrado" });
    res.status(200).json(event);
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}
/** Retorna todos os eventos */
export async function getAllEvents(req, res) {
  try {
    const events = await Event.find();
    if (!events) return res.status(404).json({ status: "error", error: "Evento não encontrado" });
    res.status(200).json(events);
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}

/** Recebe o id de um evento e retorna seus convite */
export async function getEventInvites(req, res) {
  try {
    const event = await Event.find({ _id: req.params.id });
    if (!event) return res.status(404).json({ status: "error", error: "Evento não encontrado" });
    res.status(200).json(event.invites);
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}
