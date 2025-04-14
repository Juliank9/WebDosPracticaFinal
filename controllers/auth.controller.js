const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const {validationResult} = require('express-validator');
const {hashPassword} = require('../services/password.service');
const {generateToken} = require('../services/jwt.service');
const generateCode = require('../utils/generateCode');
const {comparePassword} = require('../services/password.service');


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
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {code} = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        if (user.status === 'validated') {
            return res.status(400).json({message: 'El email ya está validado'});
        }

        if (user.validationCode !== code) {
            user.validationAttempts += 1;
            await user.save();
            return res.status(400).json({message: 'Código inválido'});
        }

        user.status = 'validated';
        await user.save();

        return res.status(200).json({message: 'Email validado correctamente'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if (!user) return res.status(401).json({message: 'Credenciales incorrectas'});

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({message: 'Credenciales incorrectas'});

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
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.acceptInvitation = async (req, res) => {
    const {token, password} = req.body;

    if (!token || !password)
        return res.status(400).json({message: 'Faltan datos'});

    try {
        console.log('TOKEN A VERIFICAR:', token);
        console.log('SECRET:', process.env.JWT_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const existing = await User.findOne({email: decoded.email});
        if (existing)
            return res.status(409).json({message: 'Ya existe ese email'});

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: decoded.email,
            password: hashedPassword,
            role: decoded.role || 'guest',
            status: 'validated',
            company: decoded.company || null,
        });

        const authToken = generateToken(user); // ✅ usa el mismo de login y register

        res.status(201).json({
            user: {
                email: user.email,
                role: user.role,
                status: user.status,
            },
            token: authToken,
        });
    } catch (err) {
        console.error(err);
        res
            .status(400)
            .json({message: 'Token de invitación inválido o expirado'});
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email requerido' });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado' });

        // Crear token de recuperación válido por 15 minutos
        const resetToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Acá en un entorno real lo enviarías por email. Por ahora lo devolvemos
        res.status(200).json({
            message: 'Token de recuperación generado',
            token: resetToken,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al generar el token' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
        return res.status(400).json({ message: 'Faltan datos' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Token inválido o expirado' });
    }
};