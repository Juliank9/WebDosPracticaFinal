const User = require('../models/user.model');
const {validationResult} = require('express-validator');
const {hashPassword} = require('../services/password.service');
const {generateToken} = require('../services/jwt.service');
const generateCode = require('../utils/generateCode');
const { comparePassword } = require('../services/password.service');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {email, password} = req.body;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) return res.status(409).json({message: 'Email ya registrado'});

        const hashedPassword = await hashPassword(password);
        const validationCode = generateCode();

        const user = await User.create({
            email,
            password: hashedPassword,
            validationCode,
            validationAttempts: 0
        });

        const token = generateToken(user);

        return res.status(201).json({
            user: {
                email: user.email,
                role: user.role,
                status: user.status
            },
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.validateEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { code } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (user.status === 'validated') {
            return res.status(400).json({ message: 'El email ya está validado' });
        }

        if (user.validationCode !== code) {
            user.validationAttempts += 1;
            await user.save();
            return res.status(400).json({ message: 'Código inválido' });
        }

        user.status = 'validated';
        await user.save();

        return res.status(200).json({ message: 'Email validado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Credenciales incorrectas' });

        const token = generateToken(user);

        return res.status(200).json({
            user: {
                email: user.email,
                role: user.role,
                status: user.status
            },
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
