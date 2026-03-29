import http from 'k6/http';
import { check, sleep } from 'k6';

// Get the base URL from an environment variable, or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },  // Stay at 10 (Steady State)
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}