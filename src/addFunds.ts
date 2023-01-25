import { authedClient, checkSufficientFunds, makeDeposit } from './coinbase';
import log from './logger';

export async function addFunds(amount) {
  const accounts = await authedClient.getAccounts();
  if (!checkSufficientFunds(accounts, 'USD', amount)) {
    log.warn(`Insufficient funds for upcoming week ($${amount})!`);

    const result = await makeDeposit(amount); // it takes 1 days for DAILY_BUY to clear
    log.debug(
      `Initiated deposit of ${result.amount} with id ${result.id} paying out at ${result.payout_at}`,
    );
  } else {
    log.info('Sufficient funds!');
  }
}
