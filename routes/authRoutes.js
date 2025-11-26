const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/registrar', authController.registerPage);
router.post('/registrar', authController.register);
router.get('/logout', authController.logout);

// Admin User Management
console.log("Loading Admin User Routes...");
const { isAdmin } = require('../middlewares/authMiddleware');
router.get('/admin/users/create', isAdmin, authController.createUserPage);
router.post('/admin/users/create', isAdmin, authController.createUser);

module.exports = router;
