const {body} = require('express-validator');

exports.validatePersonalData = [
    body('name').notEmpty().withMessage('Nombre obligatorio'),
    body('lastname').notEmpty().withMessage('Apellidos obligatorios'),
    body('nif').notEmpty().withMessage('NIF obligatorio')
];

exports.validateCompanyData = [
    body('name').notEmpty().withMessage('Nombre de empresa obligatorio'),
    body('cif').notEmpty().withMessage('CIF obligatorio'),
    body('address').notEmpty().withMessage('Dirección obligatoria')
];
