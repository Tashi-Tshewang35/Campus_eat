const Feedback = require('../models/Feedback');
const Restaurant = require('../models/Restaurant');

exports.submitFeedback = async (req, res) => {
  const restaurantId = req.params.id;
  const restaurant = await Restaurant.getRestaurantById(restaurantId);

  if (!restaurant) {
    return res.status(404).send('Restaurant not found.');
  }

  const { customerName, rating, comment } = req.body;
  const numericRating = Number(rating);

  if (!customerName || !numericRating || numericRating < 1 || numericRating > 5) {
    return res.redirect(`/restaurants/${restaurantId}/menu`);
  }

  await Feedback.createFeedback({ restaurantId, customerName, rating: numericRating, comment });
  res.redirect(`/restaurants/${restaurantId}/menu`);
};
