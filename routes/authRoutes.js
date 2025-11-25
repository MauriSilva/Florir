const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/registrar', authController.registerPage);
router.post('/registrar', authController.register);
router.get('/logout', authController.logout);

module.exports = router;
