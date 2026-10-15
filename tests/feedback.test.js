const request = require('supertest');
const { randomUUID } = require('node:crypto');
const app = require('../app');
const db = require('../config/db');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { connectMongo, closeMongo } = require('../config/mongo');

let restaurantId, otherRestaurantId, adminId;
let mongo;
const adminEmail = `feedback.admin.${randomUUID()}.sherubtse@rub.edu.bt`;

beforeAll(async () => {
  mongo = await connectMongo();
  const r1 = await db.one(
    `INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, $3) RETURNING id`,
    ['Feedback Cafe', 'Test', 4]
  );
  restaurantId = r1.id;
  const r2 = await db.one(
    `INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, $3) RETURNING id`,
    ['Other Cafe', 'Test', 4]
  );
  otherRestaurantId = r2.id;

  const admin = await User.createUser({
    name: 'Feedback Admin',
    email: adminEmail,
    password: 'adminpass123',
    verificationToken: 'not-needed',
  });
  adminId = admin.id;
  await db.none(`UPDATE users SET is_verified = true, role = 'admin' WHERE id = $1`, [adminId]);
  await db.none('UPDATE restaurants SET owner_id = $1 WHERE id = $2', [adminId, restaurantId]);
});

afterAll(async () => {
  try {
    if (mongo) {
      const restaurantIds = [restaurantId, otherRestaurantId].filter(id => id !== undefined);
      await mongo.collection('feedback').deleteMany({ restaurantId: { $in: restaurantIds } });
    }
  } finally {
    try {
      await db.tx(async t => {
        await t.none('DELETE FROM restaurants WHERE id IN ($1, $2)', [restaurantId, otherRestaurantId]);
        if (adminId !== undefined) {
          await t.none('DELETE FROM users WHERE id = $1', [adminId]);
        }
      });
    } finally {
      try {
        await closeMongo();
      } finally {
        await db.$pool.end();
      }
    }
  }
});

describe('POST /restaurants/:id/feedback', () => {
  it('stores a valid submission in MongoDB under the PostgreSQL restaurant id', async () => {
    const res = await request(app)
      .post(`/restaurants/${restaurantId}/feedback`)
      .type('form')
      .send({ customerName: 'Pema', rating: '5', comment: 'Great momos' });

    expect(res.status).toBe(302);
    const docs = await Feedback.getFeedbackForRestaurant(restaurantId);
    const saved = docs.find(d => d.comment === 'Great momos');
    expect(saved).toBeDefined();
    expect(saved.rating).toBe(5);
    expect(saved.restaurantId).toBe(restaurantId);
  });

  it('rejects an out-of-range rating and writes nothing to MongoDB', async () => {
    const before = (await Feedback.getFeedbackForRestaurant(otherRestaurantId)).length;

    await request(app)
      .post(`/restaurants/${otherRestaurantId}/feedback`)
      .type('form')
      .send({ customerName: 'Pema', rating: '9', comment: 'Invalid rating' });

    const after = (await Feedback.getFeedbackForRestaurant(otherRestaurantId)).length;
    expect(after).toBe(before);
  });

  it('returns 404 for a restaurant that does not exist in PostgreSQL, and writes nothing to MongoDB', async () => {
    const res = await request(app)
      .post('/restaurants/999999/feedback')
      .type('form')
      .send({ customerName: 'Pema', rating: '4', comment: 'Ghost restaurant' });

    expect(res.status).toBe(404);
    const mongo = await connectMongo();
    expect(await mongo.collection('feedback').countDocuments({ restaurantId: 999999 })).toBe(0);
  });
});

describe('GET /admin/dashboard (PostgreSQL + MongoDB combined)', () => {
  it('shows the admin their own restaurant and its feedback, and never another restaurant\'s', async () => {
    await Feedback.createFeedback({ restaurantId, customerName: 'Dorji', rating: 4, comment: 'Seen on dashboard' });
    await Feedback.createFeedback({ restaurantId: otherRestaurantId, customerName: 'Dorji', rating: 1, comment: 'Secret other cafe' });

    const agent = request.agent(app);
    await agent.post('/login').type('form').send({ email: adminEmail, password: 'adminpass123' });
    const res = await agent.get('/admin/dashboard');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Feedback Cafe');
    expect(res.text).toContain('Seen on dashboard');
    expect(res.text).not.toContain('Secret other cafe');
  });
});
