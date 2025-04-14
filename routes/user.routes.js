const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {validatePersonalData, validateCompanyData} = require('../validators/user.validator');
const authController = require('../controllers/auth.controller');

router.put('/onboarding/personal', authMiddleware, validatePersonalData, userController.updatePersonalData);
router.patch('/onboarding/company', authMiddleware, validateCompanyData, userController.updateCompanyData);
router.patch('/logo', authMiddleware, upload.single('logo'), userController.uploadLogo);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.delete('/', authMiddleware, userController.deleteUser);
router.post('/invite', authMiddleware, userController.sendInvitation);
router.post('/invite/accept', authController.acceptInvitation);

module.exports = router;
