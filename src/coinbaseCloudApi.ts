import axios, { AxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import uuidv4 from 'uuid/v4';
import log from './logger';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const key = process.env.COINBASE_API_KEY || '';
const secret = process.env.COINBASE_API_SECRET || '';
const uri = process.env.COINBASE_CLOUD_URI;

const PAYMENT_METHOD_ID = process.env.PAYMENT_METHOD_ID;

function sign(str, secret) {
  const hash = CryptoJS.HmacSHA256(str, secret);
  return hash.toString();
}

function signMessage(
  timestamp: string,
  requestPath: string,
  method: string,
  body: any,
) {
  const str = body
    ? timestamp + method + requestPath + JSON.stringify(body)
    : timestamp + method + requestPath;
  const sig = sign(str, secret);

  return sig;
}

async function makeRequest(requestPath: string, method: any, body?: any) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signMessage(timestamp, requestPath, method, body);

  const headers = {
    'Content-Type': 'application/json',
    'CB-ACCESS-KEY': key,
    'CB-ACCESS-TIMESTAMP': timestamp,
    'CB-ACCESS-SIGN': signature,
  };

  const options: AxiosRequestConfig = {
    method: method.toLowerCase(),
    url: `${uri}${requestPath}`,
    headers,
  };

  if (body) {
    options.data = JSON.stringify(body);
  }

  const response = await axios(options);

  return response.data;
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

export async function getOrder(orderId: string) {
  return makeRequest(`/api/v3/brokerage/orders/historical/${orderId}`, 'GET');
}

export async function sell(coin: string, amount: number) {
  const uuid = uuidv4();

  return makeRequest('/api/v3/brokerage/orders', 'POST', {
    client_order_id: uuid,
    product_id: `${coin}-USD`,
    side: 'SELL',
    order_configuration: {
      market_market_ioc: {
        base_size: amount.toString(),
      },
    },
  });
}
