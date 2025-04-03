const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {validatePersonalData, validateCompanyData} = require('../validators/user.validator');

router.put('/onboarding/personal', authMiddleware, validatePersonalData, userController.updatePersonalData);
router.patch('/onboarding/company', authMiddleware, validateCompanyData, userController.updateCompanyData);
router.patch('/logo', authMiddleware, upload.single('logo'), userController.uploadLogo);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.delete('/', authMiddleware, userController.deleteUser);

module.exports = router;
