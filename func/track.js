import { User, Wallet } from "../mongo.js";
import { balanceFunc } from "./balance.js";

export const trackFunc = async (user, address) => {
  const balance = await balanceFunc(address);
  await User.findOneAndUpdate(
    { username: user },
    { $addToSet: { wallets: address } },
    { upsert: true },
  ).exec();
  const doc = await Wallet.findOne({ address }).exec();
  if (doc) {
    doc.history.push({ date: new Date(), balance });
    await doc.save();
  } else {
    const newWallet = new Wallet({
      address,
      history: [{ date: new Date(), balance }],
    });
    await newWallet.save();
  }
  const history = doc.history.map((entry) => ({
    date: new Date(entry.date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    balance: entry.balance,
  }));
  return `History of ${address}:\n${history
    .map((entry) => `${entry.date} - ${entry.balance} SOL`)
    .join("\n")}`;
};
