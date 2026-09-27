const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

exports.dashboard = async (req, res) => {
  const restaurants = await Restaurant.getAllRestaurantsForAdmin();
  res.render('superadmin-dashboard', { title: 'Super Admin', restaurants, error: null });
};

exports.addRestaurant = async (req, res) => {
  const { name, cuisine } = req.body;
  if (name && cuisine) {
    await Restaurant.createRestaurantBySuperAdmin({ name, cuisine });
  }
  res.redirect('/superadmin/dashboard');
};

exports.removeRestaurant = async (req, res) => {
  await Restaurant.deactivateRestaurant(req.params.id);
  res.redirect('/superadmin/dashboard');
};

exports.grantAdmin = async (req, res) => {
  const { email, restaurantId } = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    const restaurants = await Restaurant.getAllRestaurantsForAdmin();
    return res.render('superadmin-dashboard', {
      title: 'Super Admin',
      restaurants,
      error: `No account found for ${email} — they need to sign up first.`,
    });
  }

  await User.promoteToAdmin(user.id, restaurantId);
  res.redirect('/superadmin/dashboard');
};
