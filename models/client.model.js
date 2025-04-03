const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    cif: {type: String, required: true},
    address: {type: String},
    email: {type: String},
    phone: {type: String},
    archived: {type: Boolean, default: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

module.exports = mongoose.model('Client', clientSchema);
