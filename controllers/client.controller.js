const Client = require('../models/client.model');
const {validationResult} = require('express-validator');

exports.createClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        const client = await Client.create({...req.body, user: req.user.id});
        res.status(201).json(client);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al crear cliente'});
    }
};

exports.getClients = async (req, res) => {
    const clients = await Client.find({user: req.user.id, archived: false});
    res.json(clients);
};

exports.getClientById = async (req, res) => {
    const client = await Client.findOne({_id: req.params.id, user: req.user.id});
    if (!client) return res.status(404).json({message: 'Cliente no encontrado'});
    res.json(client);
};

exports.updateClient = async (req, res) => {
    const client = await Client.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        req.body,
        {new: true}
    );
    if (!client) return res.status(404).json({message: 'Cliente no encontrado'});
    res.json(client);
};

exports.archiveClient = async (req, res) => {
    const client = await Client.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: true},
        {new: true}
    );
    if (!client) return res.status(404).json({message: 'Cliente no encontrado'});
    res.json({message: 'Cliente archivado'});
};

exports.recoverClient = async (req, res) => {
    const client = await Client.findOneAndUpdate(
        {_id: req.params.id, user: req.user.id},
        {archived: false},
        {new: true}
    );
    if (!client) return res.status(404).json({message: 'Cliente no encontrado'});
    res.json({message: 'Cliente recuperado'});
};

exports.deleteClient = async (req, res) => {
    const result = await Client.findOneAndDelete({_id: req.params.id, user: req.user.id});
    if (!result) return res.status(404).json({message: 'Cliente no encontrado'});
    res.json({message: 'Cliente eliminado permanentemente'});
};
