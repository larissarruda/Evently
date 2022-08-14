import { User } from "../models/index.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

/* Controller de cadastro de usuário */
export async function register(req, res) {
  const { username, password } = req.body;

  try {
    const sameName = await User.findOne({ username });
    if (sameName)
      return res.json({
        status: "error",
        error: "Nome de usuário já utilizado",
      });

    const hashedPassword = await hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    user.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.json({ status: "error", error: "Erro interno no servidor" }).status(500);
  }
}

/** Controller de Login de usuário  */
export async function login(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ status: "error", error: "Usuário não existe" });

  try {
    if (!(await compare(password, user.password))) return res.json({ status: "error", error: "Senha inválida" });

    const tokenAcesso = jwt.sign(JSON.stringify(user), process.env.ACCESS_TOKEN);
    return res.json({ tokenAcesso });
  } catch (err) {
    console.log(err);
    return res.json({ status: "error", error: "Erro interno no servidor" }).status(500);
  }
}
