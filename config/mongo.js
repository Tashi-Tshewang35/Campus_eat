const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectMongo() {
  if (db) return db;
  await client.connect();
  db = client.db('campus_eats_feedback');
  console.log('Connected to MongoDB (campus_eats_feedback)');
  return db;
}

module.exports = { connectMongo };
