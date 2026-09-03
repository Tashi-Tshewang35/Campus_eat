const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');

router.get('/', homeController.getHome);
router.get('/about', aboutController.getAbout);

module.exports = router;

const menuController = require('../controllers/menuController');

router.get('/restaurants/:id/menu', menuController.getMenuByRestaurant);

const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders/:id/update', orderController.updateOrder);
router.post('/orders/:id/cancel', orderController.cancelOrder);


