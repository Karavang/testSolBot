import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKENBOT;
import { regFunc } from "./func/reg.js";
import { mongoConnect } from "./mongo.js";
import { balanceFunc } from "./func/balance.js";
import { trackFunc } from "./func/track.js";
import { pnl } from "./func/pnl.js";
const bot = new TelegramBot(token, { polling: true });
mongoConnect();
bot.onText(/\/start/, async (msg) => {
  const res = await regFunc(msg);
  bot.sendMessage(msg.chat.id, res);
});
bot.onText(/\/balance (.+)/, async (msg, match) => {
  const res = await balanceFunc(match[1]);
  bot.sendMessage(msg.chat.id, `The balance of the wallet is ${res}`);
});

bot.onText(/\/track (.+)/, async (msg, match) => {
  const res = await trackFunc(match[1]);
  bot.sendMessage(msg.chat.id, res);
});

bot.onText(/\/leaderboard/, (msg) => {
  bot.sendMessage(msg.chat.id, resp);
});

bot.onText(/\/pnl (.+)/, async (msg, match) => {
  const res = await pnl(match[1]);
  console.log(res);
  bot.sendMessage(msg.chat.id, "pnl");
});
