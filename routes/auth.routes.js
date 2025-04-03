const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateEmailCode, validateLogin } = require('../validators/auth.validator');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', validateRegister, authController.register);
router.post('/validate-email', authMiddleware, validateEmailCode, authController.validateEmail);
router.post('/login', validateLogin, authController.login);

module.exports = router;