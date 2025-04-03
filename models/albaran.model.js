const mongoose = require('mongoose');

const albaranSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    date: {type: Date, default: Date.now},
    firmaUrl: {type: String}, // URL o path local de la firma
    archived: {type: Boolean, default: false},

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {timestamps: true});

module.exports = mongoose.model('Albaran', albaranSchema);
