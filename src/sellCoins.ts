import dotenv from 'dotenv';
import { getOrder, sell } from './coinbaseCloudApi';
import { wait } from './helpers';
import log from './logger';
import { MS_IN_SECOND } from './time';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sellCoin(coin, amount) {
  log.info(`Selling...$${amount} ${coin}`);
  const order: {
    success: boolean;
    failure_reason: string;
    order_id: string;
  } = await sell(coin, amount);

  const orderId = order.order_id;

  await wait(5 * MS_IN_SECOND);

  const fill = await getOrder(orderId);
  if (fill.order.status === 'FILLED') {
    log.info(`Success! Order: ${orderId}`);
  } else {
    log.error(`Order ${orderId} did not fill`);
  }
}

export async function sellCoins(coin: string, amount: number) {
  return sellCoin(coin, amount);
}
