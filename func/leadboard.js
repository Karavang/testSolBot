import { User, Wallet } from "../mongo.js";
import { pnl } from "./pnl.js";

export const leaderboardFunc = async () => {
  const mostLookupWallet = await Wallet.aggregate([
    {
      $project: {
        address: "$address",
        historyLength: { $size: "$history" },
        historyField: 1,
      },
    },
    {
      $sort: { historyLength: -1 },
    },
    {
      $limit: 1,
    },
  ]);
  const mostTrackedWallets = await Wallet.find();
  let pnlWallets = [];
  for (const wal of mostTrackedWallets) {
    const walletPnl = await pnl(wal.address);
    pnlWallets.push({ address: wal.address, pnl: Number(walletPnl) });
  }

  const maxPnlWallet = pnlWallets.reduce(
    (max, wallet) => (wallet.pnl > max.pnl ? wallet : max),
    pnlWallets[0],
  );
  const { address, historyLength } = mostLookupWallet[0];
  return {
    mostLookupWallet: { address, historyLength },
    mostTrackedWallets: mostTrackedWallets.length,
    maxPnlWallet,
  };
};
