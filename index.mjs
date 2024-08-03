import 'dotenv/config.js';

import express from 'express';
import cors from 'cors';
import { queryBestPools } from './the-graph.service.mjs';

const { THE_GRAPH_API_KEY, PORT, HOST_URL } = process.env;
if (!THE_GRAPH_API_KEY) throw new Error('THE_GRAPH_API_KEY is not defined');

const app = express();
const port = PORT || 3000;
const host = HOST_URL || 'http://localhost';

app.use(express.json());
app.use(cors());

app.get('/search', async (req, res) => {
  const { tokenA, tokenB } = req.query;
  const response = await queryBestPools({ tokenA, tokenB });
  res.json(response);
});

app.get('/check', (req, res) => res.send('Server is running ...'));

app.listen(port, () => {
  console.log(`Server is running on ${host}:${port}`);
});
