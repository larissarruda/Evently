import jwt from "jsonwebtoken";

/* import { config } from 'dotenv'; */
/* config(); // Carrega as variáveis de ambiente */

/** Verifica se usuário tem uma token válida, caso tenha, armazena o usuário no req.user */
export function isAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
