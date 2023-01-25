import { MarketOrder } from 'coinbase-pro';
import dotenv from 'dotenv';
import { authedClient, checkSufficientFunds } from './coinbase';
import { wait } from './helpers';
import log from './logger';
import { MS_IN_SECOND } from './time';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkFilled(fills: any, orderId: string) {
  for (const fill of fills) {
    if (fill.order_id === orderId) {
      return fill.settled;
    }
  }

  return false;
}

async function buyCoin(coin, amount) {
  const buyParams: MarketOrder = {
    funds: amount.toString(), // USD
    product_id: `${coin}-USD`,
    type: 'market',
    side: 'buy',
    size: null,
  };
  log.info(`Buying...$${amount} ${coin}`);
  const order = await authedClient.placeOrder(buyParams);

  await sleep(5000);

  const fills = await authedClient.getFills({
    product_id: `${coin}-USD`,
    order_id: order.id,
  });

  await wait(5 * MS_IN_SECOND);
  if (checkFilled(fills, order.id)) {
    log.info(`Success! Order: ${order.id}`);
  } else {
    log.error(`Order ${order.id} did not fill`);
  }
}

export async function buyCoins(coin: string, amount: number) {
  const accounts = await authedClient.getAccounts();
  if (!checkSufficientFunds(accounts, 'USD', amount)) {
    log.warn(`Insufficient funds for daily buy ($${amount}) !`);
  } else {
    // await buyCoin(COIN_TO_BUY, DAILY_BUY);
    await buyCoin(coin, amount);
  }
}
