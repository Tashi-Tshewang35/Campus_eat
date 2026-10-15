const { randomUUID } = require('node:crypto');
const db = require('../config/db');
const initDb = require('../config/initDb');

afterAll(() => db.$pool.end());

test('initializes an empty database and preserves records on repeated initialization', async () => {
  const schemaName = `schema_test_${randomUUID().replaceAll('-', '')}`;
  const rollback = new Error('Roll back isolated schema test');

  await expect(db.tx(async t => {
    await t.none('CREATE SCHEMA $1:name', [schemaName]);
    await t.none('SET LOCAL search_path TO $1:name', [schemaName]);
    await initDb(t);

    const user = await t.one(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      ['Test User', 'schema@example.test', 'test-hash']
    );
    const restaurant = await t.one(
      'INSERT INTO restaurants (name, cuisine, owner_id) VALUES ($1, $2, $3) RETURNING *',
      ['Schema Cafe', 'Test', user.id]
    );
    const item = await t.one(
      'INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING *',
      [restaurant.id, 'Momos', 50]
    );
    await t.none(
      'INSERT INTO orders (menu_item_id, customer_id, price_at_order) VALUES ($1, $2, $3)',
      [item.id, user.id, item.price]
    );

    await initDb(t);
    expect(await t.one('SELECT COUNT(*)::integer AS count FROM orders')).toEqual({ count: 1 });
    expect(restaurant.is_active).toBe(true);
    expect(user.is_verified).toBe(false);
    expect(item.times_ordered).toBe(0);
    throw rollback;
  })).rejects.toBe(rollback);
});
