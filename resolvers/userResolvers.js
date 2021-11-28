const { gql } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { authCheck } = require('../middleware/authMiddleware');
const shortid = require('shortid');
const User = require('../models/userModel');



const placeholderQuery = async (parent, args, context) => {
    return 'Placeholder is working'
}



const userCreate = async (parent, args, context) => {
    currentUser = await authCheck(context.req);
    const user = await User.findOne({email: currentUser.email});
    return user ? user : new User({
        email: currentUser.email,
        username: shortid.generate()
    }).save();
}



const userUpdate = async (parent, args, context) => {
    const currentUser = await authCheck(context.req);
    const updatedUser = await User.findOneAndUpdate({email: currentUser.email}, {...args.input}, {new: true}).exec();
    return updatedUser;
}



const profile = async (parent, args, context) => {
    const currentUser = await authCheck(context.req);
    return await User.findOne({email: currentUser.email}).exec();
}



const getUsers = async (parent, args, context) => {
    const users = await User.find({});
    if (!users) throw new Error('No users found');
    
    return users;
}



const publicProfile = async (parent, args, context) => {
    const username = args.input.username;
    if (!username || username.trim() === '') throw new Error('Username is required');

    const user = await User.findOne({username});
    if (!user) throw new Error('User not found');

    return user;
}



module.exports = {
    Query: {
        placeholderQuery,
        profile,
        getUsers,
        publicProfile
    },
    Mutation: {
        userCreate,
        userUpdate
    }
};
