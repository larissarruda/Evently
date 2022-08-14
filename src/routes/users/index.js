import { Router } from "express";
import { getUserEvents, getUserEventsById } from "../../controllers/index.js";
const userRouter = Router();

userRouter.get("/events", getUserEvents); // Retorna eventos do usuário
userRouter.get("/:id/events", getUserEventsById); // Retorna eventos do usuário

export default userRouter;
