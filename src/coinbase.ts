import axios from 'axios';
import CoinbasePro from 'coinbase-pro';
import crypto from 'crypto';
import dotenv from 'dotenv';
import _ from 'lodash';
import log from './logger';
import { MS_IN_SECOND } from './time';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const key = process.env.COINBASE_KEY || '';
const secret = process.env.COINBASE_SECRET || '';
const passphrase = process.env.COINBASE_PASSPHRASE || '';
const uri = process.env.COINBASE_URI;

const PAYMENT_METHOD_ID = process.env.PAYMENT_METHOD_ID;

export const authedClient = new CoinbasePro.AuthenticatedClient(
  key,
  secret,
  passphrase,
  uri,
);

function signMessage(
  timestamp: string,
  requestPath: string,
  method: string,
  body: any = {},
) {
  // create the prehash string by concatenating required parts
  const what = _.isEmpty(body)
    ? timestamp + method + requestPath
    : timestamp + method + requestPath + JSON.stringify(body);

  // decode the base64 secret
  const key = Buffer.from(secret, 'base64');

  // create a sha256 hmac with the secret
  const hmac = crypto.createHmac('sha256', key);

  // sign the require message with the hmac
  // and finally base64 encode the result
  return hmac.update(what).digest('base64');
}

async function makeRequest(requestPath: string, method: any, body?: any) {
  const timestamp = _.round(Date.now() / MS_IN_SECOND, 0).toString();
  const signature = signMessage(timestamp, requestPath, method, body);

  try {
    const headers = {
      'CB-ACCESS-KEY': key,
      'CB-ACCESS-PASSPHRASE': passphrase,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-SIGN': signature,
    };
    const options: { method: any; headers: any; body?: any } = {
      method: method,
      headers,
    };
    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await axios({
      method: method.toLowerCase(),
      url: `https://api.pro.coinbase.com${requestPath}`,
      headers,
      data: body,
    });

    return response.data;
  } catch (error) {
    log.error(error);
  }
}

export function checkSufficientFunds(
  accounts: any[],
  currency: string,
  minFunds: number,
) {
  for (const account of accounts) {
    if (account.currency === currency) {
      log.info(`Amount available: $${account.available}`);
      return account.available >= minFunds;
    }
  }
}

export async function getPaymentMethods() {
  return await makeRequest('/payment-methods', 'GET');
}

export async function makeDeposit(amount: number) {
  return await makeRequest('/deposits/payment-method', 'POST', {
    amount,
    currency: 'USD',
    payment_method_id: PAYMENT_METHOD_ID,
  });
}
