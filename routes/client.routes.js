/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear cliente
 *     tags: [Clients]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201: { description: Cliente creado }
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/client.controller');
const auth = require('../middlewares/auth.middleware');
const {validateClient} = require('../validators/client.validator');

router.use(auth);

router.post('/', validateClient, controller.createClient);
router.get('/', controller.getClients);
router.get('/:id', controller.getClientById);
router.put('/:id', controller.updateClient);
router.patch('/:id/archive', controller.archiveClient);
router.patch('/:id/recover', controller.recoverClient);
router.delete('/:id', controller.deleteClient);

module.exports = router;
