const {body} = require('express-validator');

exports.validateClient = [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('cif').notEmpty().withMessage('El CIF es obligatorio')
];
