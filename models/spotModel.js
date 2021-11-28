const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;



const spotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    images: [
        {
            url: {type: String, required: true},
            public_id: {type: String, required: true}
        }
    ],
    where: {
        type: String,
        default: 'No location description provided'
    },
    highlight: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'No description provided'
    },
    category: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    tags: [
        {type: ObjectId, ref: 'Tag'}
    ],
    lat: {
        type: String,
        required: true
    },
    long: {
        type: String,
        required: true
    },
    postedBy: {
        type: String,
        required: true
    },
    likes: [
        {
            // likedBy: {type: ObjectId, ref: 'User'}
            type: String
        }
    ]
}, {timestamps: true});



module.exports = mongoose.model('Spot', spotSchema);