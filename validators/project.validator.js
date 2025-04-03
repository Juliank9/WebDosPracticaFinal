const {body} = require('express-validator');

exports.validateProject = [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('client').notEmpty().withMessage('El ID del cliente es obligatorio')
];
