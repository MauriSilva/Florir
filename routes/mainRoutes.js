const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/sobre', mainController.sobre);
router.get('/contato', mainController.contatoPage);
router.post('/contato', mainController.contato);
router.get('/mapas', mainController.mapas);
router.get('/termos', mainController.termos);

// Community
router.get('/comunidade', mainController.comunidade);
router.post('/comunidade', mainController.postComunidade);
router.post('/comunidade/deletar/:id', isAdmin, mainController.deleteComentario);

// Admin Comments
router.get('/admin/comentarios', isAdmin, mainController.adminComments);
router.post('/admin/comentarios/aprovar/:id', isAdmin, mainController.approveComentario);
router.post('/admin/comentarios/deletar/:id', isAdmin, mainController.deleteComentario);

module.exports = router;
