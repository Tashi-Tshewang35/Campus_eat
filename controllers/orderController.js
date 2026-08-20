exports.createOrder = (req, res) => {
  const { itemName, price } = req.body;

  // TODO next lab: save this to the orders table through Order.js instead
  const order = { itemName, price, placedAt: new Date() };

  res.render('order_confirmation', { title: 'Order Confirmed', order });
};
