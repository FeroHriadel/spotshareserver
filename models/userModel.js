const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    about: {
        type: String
    },
    image: {
        url: {type: String, default: 'nophoto'},
        public_id: {type: String, default: Date.now}
    },
    role: {
        type: String,
        default: 'user'
    }
}, {timestamps: true});


module.exports = mongoose.model('User', userSchema);
