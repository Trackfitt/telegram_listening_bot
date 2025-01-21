require('dotenv').config();
const express = require('express');
const connectDB = require('./database');
const { bot } = require('./bot');

const app = express();

// Add JSON parsing middleware
app.use(express.json());

// Webhook endpoint
app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Telegram Bot is running!');
});

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB();