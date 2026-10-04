const db = require('../config/db');

exports.getAllRestaurantsForAdmin = () => {
  return db.any('SELECT * FROM restaurants ORDER BY id');
};

exports.createRestaurantBySuperAdmin = ({ name, cuisine }) => {
  return db.one(
    'INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, 0) RETURNING *',
    [name, cuisine]
  );
};

exports.deactivateRestaurant = (id) => {
  return db.none('UPDATE restaurants SET is_active = false WHERE id = $1', [id]);
};

exports.getAllRestaurants = () => {
  return db.any('SELECT * FROM restaurants WHERE is_active = true ORDER BY id');
};

exports.getRestaurantById = (id) => {
  return db.oneOrNone(
    'SELECT * FROM restaurants WHERE id = $1 AND is_active = true',
    [id]
  );
};

exports.getRestaurantByOwnerId = ownerId => db.oneOrNone(
  // An admin dashboard represents one restaurant. Older data may contain
  // duplicate ownership rows, so choose the oldest active assignment.
  'SELECT * FROM restaurants WHERE owner_id = $1 AND is_active = true ORDER BY id LIMIT 1', [ownerId]
);
