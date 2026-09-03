const db = require('../config/db');

exports.getAllRestaurants = () => {
  return db.any('SELECT * FROM restaurants ORDER BY id');
};

exports.getRestaurantById = (id) => {
  return db.oneOrNone('SELECT * FROM restaurants WHERE id = $1', [id]);
};
