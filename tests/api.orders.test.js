const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const User = require('../models/User');

let restaurantId, menuItemId, testUserEmail;

beforeAll(async () => {
  const restaurant = await db.one(
    `INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, $3) RETURNING id`,
    ['Order Test Cafe', 'Test Cuisine', 4.0]
  );
  restaurantId = restaurant.id;

  const item = await db.one(
    `INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING id`,
    [restaurantId, 'Test Momos', 120]
  );
  menuItemId = item.id;

  testUserEmail = 'jest.tester.sherubtse@rub.edu.bt';
  const user = await User.createUser({
    name: 'Jest Tester',
    email: testUserEmail,
    password: 'testpass123',
    verificationToken: 'not-needed-for-this-test',
  });
  await db.none('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
});

afterAll(async () => {
  await db.none('DELETE FROM orders WHERE menu_item_id = $1', [menuItemId]);
  await db.none('DELETE FROM menu_items WHERE id = $1', [menuItemId]);
  await db.none('DELETE FROM restaurants WHERE id = $1', [restaurantId]);
  await db.none('DELETE FROM users WHERE email = $1', [testUserEmail]);
  await db.$pool.end();
});

describe('POST /api/orders while logged out', () => {
  it('returns 401 and does not create an order', async () => {
    const res = await request(app).post('/api/orders').send({ itemId: menuItemId });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/orders while logged in', () => {
  it('logs in, then places an order carrying the logged-in customer_id', async () => {
    const agent = request.agent(app);

    await agent.post('/login').send({ email: testUserEmail, password: 'testpass123' });

    const res = await agent.post('/api/orders').send({ itemId: menuItemId });
    expect(res.status).toBe(201);
    expect(res.body.menu_item_id).toBe(menuItemId);
    expect(res.body.customer_id).not.toBeNull();
  });
});
