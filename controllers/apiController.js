const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { isPositiveId } = require('../utils/validation');

exports.getRestaurants = async (req, res) => {
  const restaurants = await Restaurant.getAllRestaurants();
  res.json(restaurants);
};

exports.getRestaurantMenu = async (req, res) => {
  if (!isPositiveId(req.params.id)) return res.status(400).json({ error: 'Invalid restaurant ID' });
  const restaurant = await Restaurant.getRestaurantById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const menuItems = await MenuItem.getMenuByRestaurant(req.params.id);
  res.json({ restaurant, menuItems });
};
exports.getOrder = async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Please log in.' });
  if (!isPositiveId(req.params.id)) return res.status(400).json({ error: 'Invalid order ID' });
  const order = await Order.getOrderById(req.params.id);

  if (!order || String(order.customer_id) !== String(req.session.user.id)) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
};

exports.createOrder = async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Please log in.' });
  const { itemId } = req.body || {};
  if (!isPositiveId(itemId)) return res.status(400).json({ error: 'Invalid menu item' });
  const item = await MenuItem.getMenuItemById(itemId);

  if (!item) {
    return res.status(400).json({ error: 'Invalid menu item' });
  }

  const order = await Order.createOrder(item.id, item.price, req.session.user.id);
  res.status(201).json(order);
};

exports.getStats = async (req, res) => {
  const stats = await Order.getStats();
  const popularItems = await Order.getPopularItems();
  res.json({ stats, popularItems });
};