const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

const bot = new TelegramBot(config.telegramBotToken, { polling: true });

// Log bot start
bot.onText(/\/start/, (msg) => {
  console.log(`Bot started by ${msg.from.first_name} (ID: ${msg.chat.id})`);
});

// Function to send messages to the chat
const sendMessage = (text) => {
  bot.sendMessage(config.telegramChatId, text);
};

module.exports = { bot, sendMessage };