const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
    tokenExpire: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
