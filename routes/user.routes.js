/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operaciones sobre usuarios autenticados
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener el usuario actual
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Usuario devuelto }
 */

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Eliminar usuario (soft o hard)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *     responses:
 *       200: { description: Usuario eliminado }
 */

/**
 * @swagger
 * /api/users/onboarding/personal:
 *   put:
 *     summary: Completar datos personales
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               lastname: { type: string }
 *               nif: { type: string }
 *     responses:
 *       200: { description: Datos personales actualizados }
 */

/**
 * @swagger
 * /api/users/onboarding/company:
 *   patch:
 *     summary: Completar datos de la compañía
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               cif: { type: string }
 *               address: { type: string }
 *               isAutonomous: { type: boolean }
 *     responses:
 *       200: { description: Compañía actualizada }
 */

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
