import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

export const getCoinRequisitionDuration = new Trend('get_coinprice', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'], // Taxa de falhas de requisições deve ser inferior a 12%
    http_req_duration: ['p(95)<5700'] // Duração média das requisições deve ser inferior a 5,7 segundos (5700ms)
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
  const baseUrl = 'https://api.coindesk.com/v1/bpi/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}currentprice.json`, params);

  getCoinRequisitionDuration.add(res.timings.duration);

  check(res, {
    'GET Current Bitcoin Price - Status 200': () => res.status === OK
  });
}
