const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const aboutController = require('../controllers/aboutController');

router.get('/', homeController.getHome);
router.get('/about', aboutController.getAbout);

module.exports = router;

const menuController = require('../controllers/menuController');

router.get('/menu', menuController.getMenu);

const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);



