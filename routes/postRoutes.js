const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Public
router.get('/', postController.index);
router.get('/posts/:id', postController.show);
router.get('/conteudo', postController.conteudo);

// Admin
router.get('/admin', isAdmin, postController.adminPanel);
router.get('/admin/create', isAdmin, postController.createPage);
router.post('/admin/create', isAdmin, postController.create);
router.get('/admin/edit/:id', isAdmin, postController.editPage);
router.post('/admin/edit/:id', isAdmin, postController.update);
router.post('/admin/deletar/:id', isAdmin, postController.delete);

module.exports = router;
