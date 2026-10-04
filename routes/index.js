const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');
const authController = require('../controllers/authController');
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController');
const adminController = require('../controllers/adminController');
const superAdminController = require('../controllers/superAdminController');
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// Pages
router.get('/', homeController.getHome);
router.get('/about', aboutController.getAbout);

// Menu
router.get('/restaurants/:id/menu', menuController.getMenuByRestaurant);

// Orders (must be logged in)
router.post('/orders', requireAuth, orderController.createOrder);
router.get('/orders/:id', requireAuth, orderController.getOrder);
router.post('/orders/:id/update', requireAuth, orderController.updateOrder);
router.post('/orders/:id/cancel', requireAuth, orderController.cancelOrder);

// Auth
router.get('/signup', authController.showSignup);
router.post('/signup', authController.signup);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify/:token', authController.verifyEmail);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Restaurant admin
router.get('/admin/dashboard', requireAdmin, adminController.dashboard);
router.post('/admin/menu', requireAdmin, adminController.addMenuItem);

// Super admin
router.get('/superadmin/dashboard', requireSuperAdmin, superAdminController.dashboard);
router.post('/superadmin/restaurants', requireSuperAdmin, superAdminController.addRestaurant);
router.post('/superadmin/restaurants/:id/remove', requireSuperAdmin, superAdminController.removeRestaurant);
router.post('/superadmin/grant-admin', requireSuperAdmin, superAdminController.grantAdmin);

router.post('/restaurants/:id/feedback', feedbackController.submitFeedback);

module.exports = router;

const { connectMongo } = require('../config/mongo');

router.get('/mongo-test', async (req, res) => {
  const db = await connectMongo();
  const collections = await db.listCollections().toArray();
  res.json({ connected: true, collections });
});
