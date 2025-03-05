import { Connection, PublicKey } from "@solana/web3.js";

export async function pnl(
  walletAddress,
  rpcUrl = "https://api.mainnet-beta.solana.com",
) {
  const connection = new Connection(rpcUrl, "confirmed");

  try {
    const publicKey = new PublicKey(walletAddress);

    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 100,
    });

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const txDetails = await connection.getParsedTransaction(sig.signature);

        return {
          signature: sig.signature,
          blockTime: txDetails.blockTime
            ? new Date(txDetails.blockTime * 1000).toISOString()
            : null,
          fee: txDetails.meta.fee,
          status: txDetails.meta.status,
          instructions: txDetails.transaction.message.instructions.map(
            (inst) => ({
              programId: inst.programId.toString(),
              data: inst.data,
            }),
          ),
        };
      }),
    );

    const analytics = {
      totalTransactions: transactions.length,
      totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
      successfulTransactions: transactions.filter(
        (tx) => tx.status.Ok !== undefined,
      ).length,
    };

    return {
      walletAddress: walletAddress,
      transactions,
      analytics,
    };
  } catch (error) {
    console.error("Error fetching Solana PNL:", error);
    throw error;
  }
}
