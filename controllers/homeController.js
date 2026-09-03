const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

exports.getHome = async (req, res) => {
  const restaurants = await Restaurant.getAllRestaurants();
  const stats = await Order.getStats();
  const popularItems = await Order.getPopularItems();
  res.render('index', { title: 'Campus Eats', restaurants, stats, popularItems });
};


