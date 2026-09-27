const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { isPositiveId } = require('../utils/validation');

async function findOrder(req, res) {
  if (!isPositiveId(req.params.id)) {
    res.status(400).send('Invalid order ID.');
    return null;
  }
  const order = await Order.getOrderById(req.params.id);
  if (!order || String(order.customer_id) !== String(req.session.user.id)) {
    res.status(404).send('Order not found.');
    return null;
  }
  return order;
}

exports.createOrder = async (req, res) => {
  const { itemId } = req.body || {};
  if (!isPositiveId(itemId)) return res.status(400).send('Invalid menu item.');
  const item = await MenuItem.getMenuItemById(itemId);
  if (!item) return res.status(400).send('Invalid menu item.');
  const order = await Order.createOrder(item.id, item.price, req.session.user.id);
  res.redirect('/orders/' + order.id);
};

exports.getOrder = async (req, res) => {
  const order = await findOrder(req, res);
  if (order) res.render('order_confirmation', { title: 'Order Confirmed', order });
};

exports.updateOrder = async (req, res) => {
  const quantity = req.body?.quantity;
  if (!isPositiveId(quantity)) return res.status(400).send('Quantity must be a positive integer.');
  const order = await findOrder(req, res);
  if (!order) return;
  await Order.updateQuantity(order.id, Number(quantity));
  res.redirect('/orders/' + order.id);
};

exports.cancelOrder = async (req, res) => {
  const order = await findOrder(req, res);
  if (!order) return;
  await Order.cancelOrder(order.id);
  res.redirect('/');
};
