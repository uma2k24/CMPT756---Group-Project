import http from 'k6/http';
import { check, sleep } from 'k6';

// Get the base URL from an environment variable, or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  vus: 10,       // 10 concurrent users
  duration: '1m', // Run for 1 minute
};

export default function () {
  const url = `${BASE_URL}/parcels`; // The "Create Parcel" endpoint (Async)
  const payload = JSON.stringify({
    name: "Project Parcel",
    description: "Measuring async latency"
  });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);

  check(res, {
    'is accepted (202)': (r) => r.status === 202,
  });

  sleep(1); 
}