const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;


const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        max: 10
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        url: {type: String, default: ''},
        public_id: {type: String, default: Date.now}
    }
}, {timestamps: true});


module.exports = mongoose.model('Tag', tagSchema);