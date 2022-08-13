import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User, Event, Notification } from './model/models.js';
import { hash, compare } from 'bcrypt';

dotenv.config();

const app = express();
const port = 4000;

mongoose.connect(process.env.MONGO_URI, () => {
  console.log('Conectado ao Mongo');
});

app.use(express.json());

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Rodando na porta: ${port}`);
});

/* Verificação da token  */

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) res.sendStatus(403);
    else {
      req.user = user;
      next();
    }
  });
};

/* Registro do usuário */
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const sameName = await User.findOne({
      username,
    });
    if (sameName) {
      return res.json({
        status: 'error',
        error: 'Nome de usuário já utilizado',
      });
    }
    const hashedPassword = await hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
    });
    user.save();

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});

/* Login do usuário */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.json({
      status: 'error',
      error: 'Usuário não existe',
    });
  }
  try {
    if (await compare(password, user.password)) {
      const tokenAcesso = jwt.sign(
        JSON.stringify(user),
        process.env.ACCESS_TOKEN,
      );
      return res.json({
        tokenAcesso,
      });
    } else {
      return res.json({
        status: 'error',
        error: 'Senha inválida',
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});
/* RETORNA ID DO USUÁRIO */
app.get('/getidbyusername/:username', verificarToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    return res.json({ id: user._id }).status(200);
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Usuário não encontrado',
      })
      .status(404);
  }
});
app.get('/getusernamebyid/:id', verificarToken, async (req, res) => {
  try {
    console.log(req.params.id);
    const user = await User.findOne({ _id: req.params.id });
    console.log(user);
    if (user) {
      res.json({ username: user.username }).status(200);
    }
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Usuário não encontrado',
      })
      .status(404);
  }
});

/* CRUD EVENTOS */

app.get('/events', verificarToken, async (req, res) => {
  try {
    const events = await Event.find({ author: req.user._id }).exec();
    if (events.length > 0) {
      return res.json(events);
    } else {
      return res.json({
        status: 'error',
        error: 'Usuário não tem eventos',
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});

// Rota para criação de eventos
app.post('/event', verificarToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (await Event.findOne({ author: req.user._id, title: req.body.title })) {
      return res.json({
        status: 'error',
        error: 'Evento com mesmo título já existe',
      });
    }

    const event = new Event(req.body);
    event.author = user._id;
    await User.updateOne(
      { _id: user._id },
      { $push: { events: { eventId: event._id } } },
    );
    await event.save();
    await user.save();
    return res.json(event).status(201);
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});
app.patch('/event/:id', verificarToken, async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });

  if (event) {
    if (req.body.title ? req.body.title === event.title : false) {
      return res.json({
        status: 'error',
        error: 'Evento com mesmo título já existe',
      });
    }
    await Event.updateOne({ _id: req.params.id }, { $set: req.body });
    await event.save();
    return res.sendStatus(200);
  } else {
    return res.json(event);
  }
});
app.delete('/event/:id', verificarToken, async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  if (event) {
    const user = await User.findOne({ _id: req.user._id });
    console.log(user);
    const id = event.author.toString();
    if (req.user._id === id) {
      await Event.deleteOne({ _id: req.params.id });
      return res.sendStatus(200);
    } else {
      return res
        .json({
          status: 'error',
          error: 'Não autorizado',
        })
        .status(403);
    }
  } else {
    return res.json({
      status: 'error',
      error: 'Evento não encontrado',
    });
  }
});

app.get('/event/:id', verificarToken, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id });
    if (event) {
      return res.json(event);
    } else {
      return res.json({
        status: 'error',
        error: 'Evento não encontrado',
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});

/* Notificações */

app.patch('/notification/:id', verificarToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id });
    if (notification) {
      if (typeof notification.accepted != 'boolean') {
        return res.sendStatus(400);
      }
      if (notification.accepted === true) {
        notification.accepted = 'aceito';
      } else {
        notification.accepted = 'recusado';
      }
      notification.save();
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err);
    return res
      .json({
        status: 'error',
        error: 'Erro interno no servidor',
      })
      .status(500);
  }
});
