/**
 * @swagger
 * tags:
 *   name: Albaranes
 *   description: Gestión de albaranes y firmas
 */

/**
 * @swagger
 * /api/albaranes:
 *   post:
 *     summary: Crear un albarán
 *     tags: [Albaranes]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Albarán creado }
 */

/**
 * @swagger
 * /api/albaranes:
 *   get:
 *     summary: Obtener todos los albaranes
 *     tags: [Albaranes]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Lista de albaranes }
 */

/**
 * @swagger
 * /api/albaranes/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaranes]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Albarán devuelto }
 *       404: { description: Albarán no encontrado }
 */

/**
 * @swagger
 * /api/albaranes/{id}/firmar:
 *   patch:
 *     summary: Firmar un albarán (con imagen base64)
 *     tags: [Albaranes]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signature: { type: string }
 *     responses:
 *       200: { description: Firma guardada }
 */

/**
 * @swagger
 * /api/albaranes/{id}/pdf:
 *   get:
 *     summary: Generar PDF del albarán
 *     tags: [Albaranes]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF generado }
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/albaran.controller');
const auth = require('../middlewares/auth.middleware');
const {validateAlbaran} = require('../validators/albaran.validator');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'firma');
fs.mkdirSync(uploadDir, {recursive: true});

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        const unique = `firma_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, unique);
    }
});

const upload = multer({storage});

router.use(auth);

router.post('/', validateAlbaran, controller.createAlbaran);
router.get('/', controller.getAlbaranes);
router.get('/:id', controller.getAlbaranById);
router.put('/:id', controller.updateAlbaran);
router.patch('/:id/archive', controller.archiveAlbaran);
router.patch('/:id/recover', controller.recoverAlbaran);
router.delete('/:id', controller.deleteAlbaran);

router.patch('/:id/firma', upload.single('firma'), controller.uploadFirma);
router.get('/:id/pdf', controller.generatePdf);

module.exports = router;
