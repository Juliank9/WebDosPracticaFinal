/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Projects]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               clientId: { type: string }
 *     responses:
 *       201: { description: Proyecto creado }
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Projects]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: Lista de proyectos }
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Projects]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Proyecto devuelto }
 *       404: { description: Proyecto no encontrado }
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Projects]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Proyecto actualizado }
 */

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft delete)
 *     tags: [Projects]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Proyecto eliminado }
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/project.controller');
const auth = require('../middlewares/auth.middleware');
const {validateProject} = require('../validators/project.validator');

router.use(auth);

router.post('/', validateProject, controller.createProject);
router.get('/', controller.getProjects);
router.get('/:id', controller.getProjectById);
router.put('/:id', controller.updateProject);
router.patch('/:id/archive', controller.archiveProject);
router.patch('/:id/recover', controller.recoverProject);
router.delete('/:id', controller.deleteProject);

module.exports = router;
