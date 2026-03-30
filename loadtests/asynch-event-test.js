import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '1m',
};

export default function () {
  const url = `${BASE_URL}/shipments`;
  const payload = JSON.stringify({
    customer_id: `event-user-${__VU}`,
    origin: 'Burnaby',
    destination: 'Vancouver',
    weight_kg: 2.5,
    priority: __ITER % 2 === 0 ? 'standard' : 'express',
  });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);

  check(res, {
    'is accepted (202)': (r) => r.status === 202,
  });

  sleep(1); 
}
