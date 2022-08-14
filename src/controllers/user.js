import { User } from "../models/index.js";

/** Recebe id de um usuário e retorna dados do usuário */
export async function getUser(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ status: "error", error: "Usuário não encontrado" });
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}

/** Retorna todos os eventos do usuário */
export async function getUserEvents(req, res) {
  try {
    const userEvents = await Event.find({ author: req.user._id });
    return userEvents ? res.status(200).json(userEvents) : res.status(404).json({ status: "error", error: "Você não possui eventos criados" });
  } catch (err) {
    return res.status(500).json({ status: "error", error: "Erro interno no servidor" });
  }
}

/** Recebe id de um usuário e retorna seus eventos  */
export async function getUserEventsById(req, res) {}

/** Retorna convites do usuário */
export async function getUserInvites(req, res) {}
