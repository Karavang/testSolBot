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
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const pnl = Number(last.balance) - Number(prev.balance);
  return `${pnl}`;
}
