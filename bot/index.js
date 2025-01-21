const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

// Remove polling and add webhook options
const bot = new TelegramBot(config.telegramBotToken, {
  webHook: {
    port: process.env.PORT
  }
});

// Set webhook URL - add this after bot initialization
const url = 'https://telegram-listening-bot.onrender.com'; // Replace with your Render URL
bot.setWebHook(`${url}/webhook/${config.telegramBotToken}`);

// Function to send messages to the chat
const sendMessage = (text) => {
  bot.sendMessage(config.telegramChatId, text);
};

module.exports = { bot, sendMessage };