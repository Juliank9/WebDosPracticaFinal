const Project = require('../models/project.model');
const {validationResult} = require('express-validator');

exports.createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        const project = await Project.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al crear proyecto'});
    }
};

exports.getProjects = async (req, res) => {
    const projects = await Project.find({user: req.user.id, archived: false}).populate('client');
    res.json(projects);
};

exports.getProjectById = async (req, res) => {
    const project = await Project.findOne({_id: req.params.id, user: req.user.id}).populate('client');
    if (!project) return res.status(404).json({message: 'Proyecto no encontrado'});
    res.json(project);
};

exports.updateProject = async (req, res) => {
    const project = await Project.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        req.body,
        {new: true}
    );
    if (!project) return res.status(404).json({message: 'Proyecto no encontrado'});
    res.json(project);
};

exports.archiveProject = async (req, res) => {
    const project = await Project.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: true},
        {new: true}
    );
    if (!project) return res.status(404).json({message: 'Proyecto no encontrado'});
    res.json({message: 'Proyecto archivado'});
};

exports.recoverProject = async (req, res) => {
    const project = await Project.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: false},
        {new: true}
    );
    if (!project) return res.status(404).json({message: 'Proyecto no encontrado'});
    res.json({message: 'Proyecto recuperado'});
};

exports.deleteProject = async (req, res) => {
    const result = await Project.findOneAndDelete({_id: req.params.id, user: req.user.id});
    if (!result) return res.status(404).json({message: 'Proyecto no encontrado'});
    res.json({message: 'Proyecto eliminado permanentemente'});
};
