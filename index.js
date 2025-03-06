import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
const token = process.env.TOKENBOT;
import { regFunc } from "./func/reg.js";
import { mongoConnect } from "./mongo.js";
import { balanceFunc } from "./func/balance.js";
import { trackFunc } from "./func/track.js";
import { pnl } from "./func/pnl.js";
import { leaderboardFunc } from "./func/leadboard.js";
const bot = new TelegramBot(token, { polling: true });
mongoConnect();
bot.onText(/\/start/, async (msg) => {
  const res = await regFunc(msg);
  bot.sendMessage(msg.chat.id, res);
});
bot.onText(/\/balance (.+)/, async (msg, match) => {
  const res = await balanceFunc(match[1]);
  bot.sendMessage(msg.chat.id, `The balance of the wallet is ${res} SOL`);
});

bot.onText(/\/track (.+)/, async (msg, match) => {
  const res = await trackFunc(msg.chat.username, match[1]);
  bot.sendMessage(msg.chat.id, res);
});

bot.onText(/\/leaderboard/, async (msg) => {
  const res = await leaderboardFunc();
  bot.sendMessage(
    msg.chat.id,
    `The most lookup wallet ${res.mostLookupWallet.address} with a value of ${res.mostLookupWallet.historyLength} \n
Unique wallets in the system: ${res.mostTrackedWallets}\n
Wallet with the highest dynamics from the first search: ${res.maxPnlWallet.address} with a value of ${res.maxPnlWallet.pnl} SOL`,
  );
});

bot.onText(/\/pnl (.+)/, async (msg, match) => {
  const res = await pnl(match[1]);
  bot.sendMessage(msg.chat.id, `${res} SOL`);
});
