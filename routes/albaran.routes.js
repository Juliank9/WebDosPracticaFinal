const express = require('express');
const router = express.Router();
const controller = require('../controllers/albaran.controller');
const auth = require('../middlewares/auth.middleware');
const {validateAlbaran} = require('../validators/albaran.validator');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'firma');
fs.mkdirSync(uploadDir, {recursive: true});

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        const unique = `firma_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, unique);
    }
});

const upload = multer({storage});

router.use(auth);

router.post('/', validateAlbaran, controller.createAlbaran);
router.get('/', controller.getAlbaranes);
router.get('/:id', controller.getAlbaranById);
router.put('/:id', controller.updateAlbaran);
router.patch('/:id/archive', controller.archiveAlbaran);
router.patch('/:id/recover', controller.recoverAlbaran);
router.delete('/:id', controller.deleteAlbaran);

router.patch('/:id/firma', upload.single('firma'), controller.uploadFirma);
router.get('/:id/pdf', controller.generatePdf);

module.exports = router;
