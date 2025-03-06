import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

/**
 * Ждем указанное время (в мс)
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Вычисляет PnL по публичному ключу кошелька.
 * @param {string} walletAddress - Публичный ключ кошелька.
 * @param {number} lookbackDays - Количество дней для анализа транзакций.
 * @returns {Promise<Object>} - Результаты анализа, включая pnl.
 */
export async function pnl(walletAddress, lookbackDays = 30) {
  // Устанавливаем соединение с сетью Solana
  const connection = new Connection(clusterApiUrl("mainnet-beta"));

  // Проверяем корректность и создаём объект PublicKey
  let pubKey;
  try {
    pubKey = new PublicKey(walletAddress);
  } catch (err) {
    throw new Error(`Неверный адрес кошелька: ${walletAddress}`);
  }

  // Вычисляем дату начала анализа
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);

  // Запрашиваем транзакционные подписи
  const signatures = await connection.getSignaturesForAddress(pubKey, {
    limit: 100,
  });
  if (signatures.length === 0) {
    return {
      walletAddress,
      message: "Транзакции не найдены",
      transactions: [],
    };
  }

  // Переменные для подсчёта общего изменения баланса и комиссий
  const transactions = [];
  let totalSolChange = 0;
  let totalFees = 0;

  // Обрабатываем каждую транзакцию
  for (const sig of signatures) {
    const txDate = new Date(sig.blockTime * 1000);
    if (txDate < startDate) continue;

    let tx = null;
    let delayMs = 500;
    const maxRetries = 5;
    // Реализуем повторные попытки запроса транзакции при ошибке 429
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        tx = await connection.getTransaction(sig.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });
        break; // запрос выполнен успешно
      } catch (err) {
        if (err.message.includes("429")) {
          console.warn(
            `Server responded with 429. Retrying after ${delayMs}ms...`,
          );
          await sleep(delayMs);
          delayMs *= 10; // экспоненциальное увеличение задержки
        } else {
          console.error(`Ошибка транзакции ${sig.signature}:`, err.message);
          break;
        }
      }
    }

    if (!tx) continue;

    // Получаем комиссию транзакции в SOL
    const fee = tx.meta.fee / LAMPORTS_PER_SOL;
    totalFees += fee;

    // Проверяем наличие необходимых данных для расчёта изменений баланса
    if (
      tx.meta.preBalances &&
      tx.meta.postBalances &&
      tx.transaction &&
      tx.transaction.message &&
      Array.isArray(tx.transaction.message.accountKeys)
    ) {
      const accountIndex = tx.transaction.message.accountKeys.findIndex(
        (key) => key.toString() === pubKey.toString(),
      );

      if (accountIndex >= 0) {
        const preSol = tx.meta.preBalances[accountIndex] / LAMPORTS_PER_SOL;
        const postSol = tx.meta.postBalances[accountIndex] / LAMPORTS_PER_SOL;
        const change = postSol - preSol + fee; // добавляем комиссию обратно

        if (Math.abs(change) > 0.001) {
          totalSolChange += change;

          transactions.push({
            date: txDate.toISOString(),
            signature: sig.signature,
            solChange: change.toFixed(4),
            fee: fee.toFixed(4),
            type: change > 0 ? "Received" : "Sent",
          });
        }
      } else {
        console.warn(
          `accountKeys не содержит ключ ${pubKey.toString()} в транзакции ${
            sig.signature
          }`,
        );
      }
    } else {
      console.warn(`Неверная структура транзакции ${sig.signature}`);
    }
  }

  // Вычисляем итоговый pnl
  const pnlValue = (totalSolChange - totalFees).toFixed(4);

  return {
    walletAddress,
    transactionsAnalyzed: transactions.length,
    totalSolChange: totalSolChange.toFixed(4),
    totalFees: totalFees.toFixed(4),
    netSolChange: pnlValue,
    periodDays: lookbackDays,
    transactions,
  };
}
