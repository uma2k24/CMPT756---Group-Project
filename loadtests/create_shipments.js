import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    steady_load: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 10),
      duration: __ENV.DURATION || "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:8000";

export default function () {
  const payload = JSON.stringify({
    customer_id: `cust-${__VU}`,
    origin: "Burnaby",
    destination: "Vancouver",
    weight_kg: 2.5,
    priority: __ITER % 2 === 0 ? "standard" : "express",
  });

  const response = http.post(`${baseUrl}/shipments`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(response, {
    "accepted shipment": (r) => r.status === 202,
  });

  sleep(1);
}
