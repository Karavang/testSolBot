import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKENBOT;
import { regFunc } from "./func/reg.js";
import { mongoConnect } from "./mongo.js";
import { balanceFunc } from "./func/balance.js";
const bot = new TelegramBot(token, { polling: true });
mongoConnect();
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const res = await regFunc(msg);

  console.log(res);
  bot.sendMessage(chatId, res);
});
bot.onText(/\/balance (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;

  const res = await balanceFunc(match[1]);
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, res);
});

// bot.onText(/\/track (.+)/, (msg, match: string) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// bot.onText(/\/leaderboard/, (msg) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// bot.onText(/\/pnl (.+)/, (msg, match: string) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });
