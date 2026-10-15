const fs = require('node:fs');
const path = require('node:path');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function initDb(db = require('./db')) {
  await db.tx(async t => {
    // Serialize initialization when multiple service instances start together.
    await t.one('SELECT pg_advisory_xact_lock(734912801)');
    await t.none(schema);
  });
}

module.exports = initDb;
