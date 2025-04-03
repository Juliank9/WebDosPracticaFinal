const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String},
    archived: {type: Boolean, default: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true}
}, {timestamps: true});

module.exports = mongoose.model('Project', projectSchema);
