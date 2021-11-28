const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;


const commentSchema = new mongoose.Schema({
    spotSlug: {
        type: String,
        required: true
    },
    image: {
        url: {type: String},
        public_id: {type: String}
    },
    content: {
        type: String,
        required: true
    },
    commentedBy: {
        type: ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});


module.exports = mongoose.model('Comment', commentSchema);