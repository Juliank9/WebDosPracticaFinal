const {body} = require('express-validator');

exports.validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Email inválido'),
    body('password')
        .isLength({min: 8})
        .withMessage('La contraseña debe tener al menos 8 caracteres')
];

exports.validateEmailCode = [
    body('code')
        .isLength({min: 6, max: 6})
        .withMessage('El código debe tener 6 dígitos')
        .isNumeric()
        .withMessage('El código debe ser numérico')
];

exports.validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
];