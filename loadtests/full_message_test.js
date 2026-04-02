// https://github.com/grafana/xk6-amqp
import Amqp from 'k6/x/amqp';
import Queue from 'k6/x/amqp/queue';
import { Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'amqp://guest:guest@localhost:5672/';

// Keep track of data size to calculate throughput
// as xk6 extension doesn't automatically track this
// Printed in terminal summary as custom field
// Apparently, unit = bytes
const total_data = new Counter('total_data');

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '1m',
};

// Tests based on Pacco-sample-scenario.rest file
export default function () {
  const user_id = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `pacco-user${user_id}@mailinator.com`;
  
  // Connect to RabbitMQ
  Amqp.start({ connection_url: BASE_URL });
  const pacco_queue = 'Pacco queue';
  Queue.declare({ name: pacco_queue, });

  // Register Pacco account
  const register_payload = JSON.stringify({
    email: email,
    password: 'secret',
    role: 'user',
  });

  total_data.add(register_payload.length);

  // Produce message
  Amqp.publish({
    queue_name: pacco_queue,
    body: register_payload,
    content_type: 'application/json',
  });

  const pacco_consumer = 'Pacco consumer';

  // Consume message
  const listener = function(data) { }
  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Log in to Pacco account
  const login_payload = JSON.stringify({
    email: email,
    password: 'secret',
  });

  total_data.add(login_payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: login_payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Create customer
  const customer_payload = JSON.stringify({
    fullName: 'John Doe',
    address: `New York`,
  });

  total_data.add(customer_payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: customer_payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // The "Create Parcel" endpoint (Async)
  const payload = JSON.stringify({
    variant: 'weapon',
    size: 'large',
    name: 'Parcel #1',
    description: 'My parcel #1',
  });

  total_data.add(payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Create new order
  Amqp.publish({
    queue_name: pacco_queue,
    body: '',
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Add parcel to order
  Amqp.publish({
    queue_name: pacco_queue,
    body: '',
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Create vehicle to deliver order
  const vehicle_payload = JSON.stringify({
    brand: 'Brand',
    model: 'Model',
    description: 'Vehicle description',
    payloadCapacity: 1000,
    loadingCapacity: 1000,
    pricePerService: 100,
    variants: 1,
  });

  total_data.add(vehicle_payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: vehicle_payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Add vehicle to our current order
  const delivery_date = '2026-04-02';

  const add_veh_payload = JSON.stringify({
    deliveryDate: delivery_date,
  });

  total_data.add(add_veh_payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: add_veh_payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Start order/parcel delivery
  const start_deliv_payload = JSON.stringify({
    orderId: user_id,
    description: 'Delivery description',
    dateTime: delivery_date,
  });

  total_data.add(start_deliv_payload.length);

  Amqp.publish({
    queue_name: pacco_queue,
    body: start_deliv_payload,
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });


  // Complete delivery
  Amqp.publish({
    queue_name: pacco_queue,
    body: '',
    content_type: 'application/json',
  });

  Amqp.listen({
    queue_name: pacco_queue,
    listener: listener,
    auto_ack: true,
    consumer: pacco_consumer,
  });
}
