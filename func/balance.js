import { Connection, PublicKey } from "@solana/web3.js";

export const balanceFunc = async (wallet) => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  let publicKey;
  try {
    publicKey = new PublicKey(wallet);
  } catch (error) {
    return "Invalid public key";
  }
  const balance = await connection.getBalance(publicKey);

  return `The balance of the wallet is ${balance / 1000000000} SOL`;
};
