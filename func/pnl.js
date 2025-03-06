import { Wallet } from "../mongo.js";

export async function pnl(walletAddress) {
  const wallet = await Wallet.findOne({ address: walletAddress }).exec();
  if (!wallet) {
    return "Wallet not found";
  }
  const history = wallet.history;
  if (history.length < 2) {
    return "Not enough data";
  }
  console.log(history);
  const last = history[history.length - 1];
  const prev = history[0];

  const pnl = Number(last.balance) - Number(prev.balance);
  console.log(prev, last, pnl);
  return `${pnl}`;
}
