<<<<<<< HEAD
import http from 'k6/http';
import { check, sleep } from 'k6';

// Get the base URL from an environment variable, or default to localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  // Define # of concurrent users at different stages
  stages: [
    { duration: '15s', target: 50 },
    { duration: '15s', target: 250 },
    { duration: '15s', target: 1000 },
    { duration: '10s', target: 0 },
  ],
};

// Tests based on Pacco-sample-scenario.rest file
export default function () {
  const params = { headers: { 'Content-Type': 'application/json', } };
  const empty_payload = '{}';
  const unique_id = Date.now();
  const email = `pacco-user-${__VU}-${unique_id}@mailinator.com`;

  // Register Pacco account
  const register_url = `${BASE_URL}/identity/sign-up`;
  const register_payload = JSON.stringify({
    email: email,
    password: 'secret',
    role: 'user',
  });
=======
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '1m',
};

// Tests based on Pacco-sample-scenario.rest file
export default function () {
  const params = { headers: { 'Content-Type': 'application/json', } };
  const empty_payload = '{}';
  const user_id = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `pacco-user${user_id}@mailinator.com`;

  // Register Pacco account
  const register_url = `${BASE_URL}/identity/sign-up`;
  const register_payload = JSON.stringify({
    email: email,
    password: 'secret',
    role: 'user',
  });
>>>>>>> 0259b2dc78e9b5d8f81eebc1a6f8dc0d4be505c0

  const register_res = http.post(register_url, register_payload, params);

  check(register_res, {
    'Register account success (201)': (r) => r.status === 201,
  });


  // Log in to Pacco account
<<<<<<< HEAD
  const login_url = `${BASE_URL}/identity/sign-in`;
  const login_payload = JSON.stringify({
    // __VU stores current user ID (1, 2, 3, etc.)
    email: email,
    password: 'secret',
  });
=======
  const login_url = `${BASE_URL}/identity/sign-in`;
  const login_payload = JSON.stringify({
    email: email,
    password: 'secret',
  });
>>>>>>> 0259b2dc78e9b5d8f81eebc1a6f8dc0d4be505c0

  const login_res = http.post(login_url, login_payload, params);
  const access_token = login_res.json('accessToken');

  check(login_res, {
    'Log in to account success (200)': (r) => r.status === 200,
  });

  // console.log(`DEBUG: Token is -> ${access_token}`);
  // Remain signed in to user account when making Pacco orders
  const auth_params = { headers: { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`, } };


  // Create customer
  // const customer_url = `${BASE_URL}/customers`;
  // const customer_payload = JSON.stringify({
  //   fullName: 'John Doe',
  //   address: `New York`,
  // });

  // const customer_res = http.post(customer_url, customer_payload, auth_params);

  // check(customer_res, {
  //   'Create customer success (201)': (r) => r.status === 201,
  // });

  // sleep(1);
  // // The "Create Parcel" endpoint (Async)
  // const url = `${BASE_URL}/parcels`;
  // const payload = JSON.stringify({
  //   variant: 'weapon',
  //   size: 'large',
  //   name: 'Parcel #1',
  //   description: 'My parcel #1',
  // });

  // const res = http.post(url, payload, auth_params);
  // let parcel_id = res.headers['Resource-Id'];
  // console.log("Parcel ID Captured: " + parcel_id)

  // check(res, {
  //   'Parcel created (201)': (r) => r.status === 201,
  // });


  // // Create new order
  // const order_url = `${BASE_URL}/orders`;
  // const order_res = http.post(order_url, empty_payload, auth_params);
  // let order_id = order_res.headers['Resource-Id'];
  // console.log("Parcel ID Captured: " + parcel_id)

  // check(order_res, {
  //   'Order success (201)': (r) => r.status === 201,
  // });


  // // Add parcel to order
  // const add_url = `${BASE_URL}/orders/${order_id}/parcels/${parcel_id}`;
  // const add_res = http.post(add_url, empty_payload, auth_params);

  // check(add_res, {
  //   'Add parcel success (200)': (r) => r.status === 200,
  // });


  // // Create vehicle to deliver order
  // const vehicle_url = `${BASE_URL}/vehicles`
  // const vehicle_payload = JSON.stringify({
  //   brand: 'Brand',
  //   model: 'Model',
  //   description: 'Vehicle description',
  //   payloadCapacity: 1000,
  //   loadingCapacity: 1000,
  //   pricePerService: 100,
  //   variants: 1,
  // });

  // const vehicle_res = http.post(vehicle_url, vehicle_payload, auth_params);
  // let vehicle_id = vehicle_res.headers['Resource-Id'];

  // check(vehicle_res, {
  //   'Create vehicle success (201)': (r) => r.status === 201,
  // });


  // // Add vehicle to our current order
  // const add_veh_url = `${BASE_URL}/orders/${order_id}/vehicles/${vehicle_id}`;
  // const delivery_date = '2026-04-02';

  // const add_veh_payload = JSON.stringify({
  //   deliveryDate: delivery_date,
  // });

  // const add_vehicle_res = http.post(add_veh_url, add_veh_payload, auth_params);

  // check(add_vehicle_res, {
  //   'Add vehicle to order success (200)': (r) => r.status === 200,
  // });


  // // Start order/parcel delivery
  // const start_deliv_url = `${BASE_URL}/deliveries`
  // const start_deliv_payload = JSON.stringify({
  //   orderId: order_id,
  //   description: 'Delivery description',
  //   dateTime: delivery_date,
  // });

  // const start_deliv_res = http.post(start_deliv_url, start_deliv_payload, auth_params);
  // let deliv_id = start_deliv_res.headers['Resource-Id'];

  // check(start_deliv_res, {
  //   'Start delivery success (201)': (r) => r.status === 201,
  // });


  // // Complete delivery
  // const complete_deliv_url = `${BASE_URL}/deliveries/${deliv_id}/complete`
  // const complete_deliv_res = http.post(complete_deliv_url, empty_payload, auth_params);
  
  // check(complete_deliv_res, {
  //   'Complete delivery success (200)': (r) => r.status === 200,
  // });


  sleep(1);
}
