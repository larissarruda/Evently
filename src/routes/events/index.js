import { Router } from "express";
import { createEvent, getEvent, updateEvent, deleteEvent, getUserEvents, getAllEvents, getEventInvites } from "../../controllers/index.js";
import { isAuth } from "../../middlewares/isAuth.js";
const eventsRouter = Router();

eventsRouter.get("/all", getAllEvents); // Retorna todos os eventos

/* CRUD Eventos */
eventsRouter.post("/", isAuth, createEvent); // Cria evento
eventsRouter.get("/:id", getEvent); // Retorna evento por id
eventsRouter.patch("/:id", isAuth, updateEvent); // Atualiza evento
eventsRouter.delete("/:id", isAuth, deleteEvent); // Deleta evento

eventsRouter.get("/:id/invite", getEventInvites); // Retorna convites de um evento por id

export default eventsRouter;
