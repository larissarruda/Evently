import { Router } from "express";

import authRoutes from "./auth/index.js";
import userRoutes from "./users/index.js";
import eventsRoutes from "./events/index.js";

import { isAuth } from "../middlewares/isAuth.js";
import { getUserInvites } from "../controllers/user.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/events", eventsRoutes);

apiRouter.get("/invites", isAuth, getUserInvites); // Retorna convites do usuário

export default apiRouter;

/* localhost:3000/api/events/ */
