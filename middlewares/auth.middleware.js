const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Token no proporcionado'});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Aquí tendrás `req.user.id` y `req.user.email`
        next();
    } catch (err) {
        return res.status(401).json({message: 'Token inválido o expirado'});
    }
};

module.exports = authMiddleware;
