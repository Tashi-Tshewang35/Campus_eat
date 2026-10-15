const { MongoClient } = require('mongodb');
require('dotenv').config();

// Supply Node's OS adapter directly so the driver also works in Jest's CommonJS sandbox.
const client = new MongoClient(process.env.MONGO_URI, {
  runtimeAdapters: { os: require('node:os') },
});
let db;

async function connectMongo() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME || 'campus_eats_feedback');
  console.log(`Connected to MongoDB (${db.databaseName})`);
  return db;
}

async function closeMongo() {
  await client.close();
  db = undefined;
}

module.exports = { connectMongo, closeMongo };
