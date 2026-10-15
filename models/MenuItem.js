const db = require('../config/db');

exports.getMenuByRestaurant = (restaurantId) => {
  return db.any('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY id', [restaurantId]);
};

exports.getMenuItemById = (id) => {
  return db.oneOrNone('SELECT * FROM menu_items WHERE id = $1', [id]);
};

exports.createMenuItem = ({ restaurantId, name, price }) => db.one(
  'INSERT INTO menu_items (restaurant_id, name, price) VALUES ($1, $2, $3) RETURNING *',
  [restaurantId, name, price]
);


