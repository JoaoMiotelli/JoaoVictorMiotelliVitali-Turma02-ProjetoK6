import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

export const getCryptoRequisitionDuration = new Trend(
  'get_crypto_duration',
  true
);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 35 },
    { duration: '10s', target: 35 },
    { duration: '15s', target: 80 },
    { duration: '30s', target: 80 },
    { duration: '20s', target: 145 },
    { duration: '40s', target: 145 },
    { duration: '25s', target: 230 },
    { duration: '50s', target: 230 },
    { duration: '60s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.coinlore.net/api/tickers/';

  const cryptoIds = '90,2710';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const res = http.get(
    `${baseUrl}?id=${cryptoIds}`,
    params
  );

  getCryptoRequisitionDuration.add(res.timings.duration);

  check(res, {
    'GET Crypto Data - Status 200': () => res.status === 200
  });
}
