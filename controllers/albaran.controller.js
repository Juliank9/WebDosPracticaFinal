const PDFDocument = require('pdfkit');
const Albaran = require('../models/albaran.model');
const {validationResult} = require('express-validator');
const Project = require('../models/project.model');

exports.createAlbaran = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        const project = await Project.findOne({_id: req.body.project, user: req.user.id});
        if (!project) return res.status(403).json({message: 'No tienes acceso a ese proyecto'});

        const albaran = await Albaran.create({
            ...req.body,
            user: req.user.id
        });

        res.status(201).json(albaran);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al crear albarán'});
    }
};

exports.getAlbaranes = async (req, res) => {
    const albaranes = await Albaran.find({user: req.user.id, archived: false}).populate('project');
    res.json(albaranes);
};

exports.getAlbaranById = async (req, res) => {
    const albaran = await Albaran.findOne({_id: req.params.id, user: req.user.id}).populate('project');
    if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});
    res.json(albaran);
};

exports.updateAlbaran = async (req, res) => {
    const albaran = await Albaran.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        req.body,
        {new: true}
    );
    if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});
    res.json(albaran);
};

exports.archiveAlbaran = async (req, res) => {
    const albaran = await Albaran.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: true},
        {new: true}
    );
    if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});
    res.json({message: 'Albarán archivado'});
};

exports.recoverAlbaran = async (req, res) => {
    const albaran = await Albaran.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: false},
        {new: true}
    );
    if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});
    res.json({message: 'Albarán recuperado'});
};

exports.deleteAlbaran = async (req, res) => {
    const result = await Albaran.findOneAndDelete({_id: req.params.id, user: req.user.id});
    if (!result) return res.status(404).json({message: 'Albarán no encontrado'});
    res.json({message: 'Albarán eliminado'});
};

exports.uploadFirma = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({message: 'No se recibió ninguna imagen'});

        const albaran = await Albaran.findOneAndUpdate(
            {_id: req.params.id, user: req.user.id},
            {firmaUrl: `/uploads/firma/${req.file.filename}`},
            {new: true}
        );

        if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});
        res.json({message: 'Firma subida correctamente', firmaUrl: albaran.firmaUrl});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al subir firma'});
    }
};

exports.generatePdf = async (req, res) => {
    try {
        const albaran = await Albaran.findOne({_id: req.params.id, user: req.user.id}).populate('project');
        if (!albaran) return res.status(404).json({message: 'Albarán no encontrado'});

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="albaran.pdf"');

        doc.text(`ALBARÁN`, {align: 'center', underline: true});
        doc.moveDown();
        doc.text(`Proyecto: ${albaran.project.name}`);
        doc.text(`Título: ${albaran.title}`);
        doc.text(`Descripción: ${albaran.description}`);
        doc.text(`Fecha: ${new Date(albaran.date).toLocaleDateString()}`);
        doc.moveDown();

        if (albaran.firmaUrl) {
            doc.text('Firma:');
            doc.image(`.${albaran.firmaUrl}`, {
                fit: [200, 200],
                align: 'center'
            });
        }

        doc.end();
        doc.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al generar PDF'});
    }
};

