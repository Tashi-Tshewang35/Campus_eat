const app = require('./app');
const { connectMongo } = require('./config/mongo');

connectMongo().catch(err => console.error('MongoDB connection failed:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Campus Eats running at http://localhost:${PORT}`));
