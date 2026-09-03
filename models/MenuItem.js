const db = require('../config/db');

exports.getMenuByRestaurant = (restaurantId) => {
  return db.any('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id', [restaurantId]);
};

exports.getMenuItemById = (id) => {
  return db.oneOrNone('SELECT * FROM menu_items WHERE id = $1', [id]);
};
