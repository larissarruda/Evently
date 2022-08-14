import express from 'express';
import mongoose from 'mongoose';
import apiRouter from './src/routes/index.js';
import { config } from 'dotenv';
config();

const app = express();
const port = 4000;

mongoose.connect(process.env.MONGO_URI, () => {
  console.log('Conectado ao Mongo');
});

app.use(express.json());

app.use(express.static('public'));

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Rodando na porta: ${port}`);
});

