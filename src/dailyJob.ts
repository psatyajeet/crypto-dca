import { CronJob } from 'cron';
import dotenv from 'dotenv';
import _ from 'lodash';
import { addFunds } from './addFunds';
import { buyCoins } from './buyCoins';
import log from './logger';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const BIWEEKLY_BUY = process.env.BIWEEKLY_BUY_AMOUNT
  ? parseFloat(process.env.BIWEEKLY_BUY_AMOUNT)
  : 0;
const DAILY_BUY = _.round(BIWEEKLY_BUY / 14, 2);
const COIN_TO_BUY = process.env.COIN_TO_BUY || 'BTC';

const ET = 'America/New_York';

log.info('Initializing jobs...');

new CronJob(
  '0 0 9 * * *',
  () => addFunds(DAILY_BUY).then(() => buyCoins(COIN_TO_BUY, DAILY_BUY)),
  '',
  true,
  ET,
);
// new CronJob('0 00 12 * * *', buyCoins, '', true, 'America/New_York');

// addFunds().then(() => buyCoins());
