const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

// Initialize bot without port binding
const bot = new TelegramBot(config.telegramBotToken, {
  webHook: true  // just enable webhooks without port
});

// Set webhook URL after deployment
const WEBHOOK_URL = process.env.WEBHOOK_URL;
bot.setWebHook(`${WEBHOOK_URL}/webhook/${config.telegramBotToken}`);

const sendMessage = (text) => {
  bot.sendMessage(config.telegramChatId, text);
};

module.exports = { bot, sendMessage };