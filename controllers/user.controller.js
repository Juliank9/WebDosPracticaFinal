const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {validationResult} = require('express-validator');

exports.updatePersonalData = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {name, lastname, nif} = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        user.name = name;
        user.lastname = lastname;
        user.nif = nif;

        await user.save();
        return res.status(200).json({message: 'Datos personales actualizados'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.updateCompanyData = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {name, cif, address, isAutonomous} = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        // Si es autónomo, usamos sus datos personales
        if (isAutonomous) {
            user.company = {
                name: user.name,
                cif: user.nif,
                address
            };
        } else {
            user.company = {name, cif, address};
        }

        await user.save();
        return res.status(200).json({message: 'Datos de compañía actualizados'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.uploadLogo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        if (!req.file) return res.status(400).json({message: 'No se ha subido ninguna imagen'});

        // Ruta del logo subida
        const logoUrl = `/uploads/logos/${req.file.filename}`;
        user.logo = logoUrl;
        await user.save();

        return res.status(200).json({message: 'Logo subido correctamente', logoUrl});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error al subir el logo'});
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -validationCode -validationAttempts');
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        return res.status(200).json({user});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error interno del servidor'});
    }
};

exports.deleteUser = async (req, res) => {
    const softDelete = req.query.soft !== 'false'; // por defecto hace soft delete

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({message: 'Usuario no encontrado'});

        if (softDelete) {
            await user.delete();
            return res.status(200).json({message: 'Usuario eliminado (soft delete)'});
        } else {
            await user.deleteOne();
            return res.status(200).json({message: 'Usuario eliminado (hard delete)'});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Error al eliminar usuario'});
    }
};

exports.sendInvitation = async (req, res) => {
    const {email} = req.body;

    if (!email) return res.status(400).json({message: 'Email obligatorio'});

    // Verifica si el email ya existe
    const existing = await User.findOne({email});
    if (existing) return res.status(409).json({message: 'El email ya está registrado'});

    const invitationPayload = {
        email,
        role: 'guest',
        company: req.user.company || null, // hereda la empresa del usuario autenticado
    };

    const invitationToken = jwt.sign(invitationPayload, process.env.JWT_SECRET, {
        expiresIn: '7d' // válido 7 días
    });

    // En práctica real se enviaría por correo. Acá lo devolvemos directamente
    res.json({
        message: 'Invitación generada correctamente',
        token: invitationToken,
    });
};

