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
