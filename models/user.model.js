const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete")

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: 'user'},
    status: {type: String, default: 'pending'},
    validationCode: {type: String},
    validationAttempts: {type: Number, default: 0},

    // Nuevos campos personales
    name: {type: String},
    lastname: {type: String},
    nif: {type: String},
    logo: { type: String },

    // Datos de compañía
    company: {
        name: {type: String},
        cif: {type: String},
        address: {type: String}
    }

}, {timestamps: true});

userSchema.plugin(mongooseDelete, {overrideMethods: "all"})

module.exports = mongoose.model('User', userSchema);
