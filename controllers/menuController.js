const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.getMenuByRestaurant = async (req, res) => {
  const restaurantId = req.params.id;
  const restaurant = await Restaurant.getRestaurantById(restaurantId);

  if (!restaurant) {
    return res.status(404).send('Restaurant not found.');
  }

  const menuItems = await MenuItem.getMenuByRestaurant(restaurantId);
  res.render('menu', { title: `Menu — ${restaurant.name}`, restaurant, menuItems });
};


