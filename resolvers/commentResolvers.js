const { gql } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { authCheck, adminCheck } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Spot = require('../models/spotModel');
const Comment = require('../models/commentModel');



const commentCreate = async (parent, args, context) => {
    const user = await authCheck(context.req);
    if (user.error) {
        console.log('Unauthorized')
        throw new Error('Please sign-in before leaving a comment');
    }
    
    const userFromDb = await User.findOne({email: user.email});
    if (!userFromDb) throw new Error('User not found in db');

    if (!args.input.spotSlug) throw new Error('Identifier (spot.slug) is required');
    if (!args.input.content || args.input.content.trim() === '') throw new Error('Comment text is required');

    const comment = new Comment({...args.input, commentedBy: userFromDb._id});
    return comment.save().then(comment => comment.populate('commentedBy', 'username').execPopulate());
}



const getComments = async (parent, args, context) => {
    if (!args.input.spotSlug || args.input.spotSlug.trim() === '') throw new Error('Spot identifier (slug) is required');

    const perPage = 3;
    const page = args.input.page || 1;
    const totalComments = await Comment.countDocuments({spotSlug: args.input.spotSlug});

    const comments = await Comment.find({spotSlug: args.input.spotSlug})
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort([['createdAt', 'desc']])
        .populate('commentedBy', 'username');

    return {page: page, comments: comments, numberOfPages: Math.ceil(totalComments/perPage)}
}



const commentDelete = async (parent, args, context) => {
    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }
    
    if (!args.input._id) throw new Error('Comment identifier is required');

    const deletedComment = await Comment.findByIdAndRemove(args.input._id);
    if (!deletedComment) throw new Error('Comment delete failed');

    return deletedComment;
}



module.exports = {
    Query: {
        getComments
    },
    Mutation: {
        commentCreate,
        commentDelete
    }
};