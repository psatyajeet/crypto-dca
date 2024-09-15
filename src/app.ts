import dotenv from 'dotenv';
import { addFunds } from './addFunds';
import { buyCoins } from './buyCoins';
import log from './logger';
import { sellCoins } from './sellCoins';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

enum Action {
  ADD_FUNDS = 'addFunds',
  BUY_COINS = 'buyCoins',
  SELL_COINS = 'sellCoins',
}

export async function handler(event: any, context: any) {
  log.info(event);
  const { action, coin, amount } = event;

  if (!action || !coin || !amount) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing action, coin, or amount',
      }),
    };
  }

  switch (action) {
    case Action.ADD_FUNDS:
      await addFunds(amount);
      break;
    case Action.BUY_COINS:
      await buyCoins(coin, amount);
      break;
    case Action.SELL_COINS:
      await sellCoins(coin, amount);
      break;
    default:
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Invalid action: ${action}`,
        }),
      };
  }

  return 'OK!';
}
