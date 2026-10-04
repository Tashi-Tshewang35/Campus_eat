const { connectMongo } = require('../config/mongo');

async function createFeedback({ restaurantId, customerName, rating, comment }) {
  const db = await connectMongo();
  return db.collection('feedback').insertOne({
    restaurantId: Number(restaurantId),
    customerName,
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date(),
  });
}

async function getFeedbackForRestaurant(restaurantId) {
  const db = await connectMongo();
  return db.collection('feedback')
    .find({ restaurantId: Number(restaurantId) })
    .sort({ createdAt: -1 })
    .toArray();
}

module.exports = { createFeedback, getFeedbackForRestaurant };
