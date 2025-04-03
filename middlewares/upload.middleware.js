const multer = require('multer');
const path = require('path');

// Carpeta destino para logos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `logo_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

// Limitar tamaño (ej: 2MB)
const upload = multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024},
    fileFilter
});

module.exports = upload;
