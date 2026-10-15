const app = require('./app');
const { connectMongo } = require('./config/mongo');
const initDb = require('./config/initDb');
const db = require('./config/db');

connectMongo().catch(err => console.error('MongoDB connection failed:', err));

const PORT = process.env.PORT || 3000;
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Campus Eats running at http://localhost:${PORT}`));
  })
  .catch(async err => {
    console.error('PostgreSQL initialization failed:', err.message);
    await db.$pool.end();
    await require('./config/mongo').closeMongo();
    process.exitCode = 1;
  });
