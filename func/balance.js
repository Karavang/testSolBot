import { Connection, PublicKey } from "@solana/web3.js";

export const balanceFunc = async (wallet) => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  try {
    const publicKey = new PublicKey(wallet);
    const balance = await connection.getBalance(publicKey);
    return `${balance / 1000000000}`;
  } catch (error) {
    return "Invalid public key";
  }
};
