const {body} = require('express-validator');

exports.validateAlbaran = [body('title').notEmpty().withMessage('El título es obligatorio'), body('project').notEmpty().withMessage('Debe vincularse a un proyecto')];
