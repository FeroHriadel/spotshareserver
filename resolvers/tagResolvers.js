const { gql } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { adminCheck } = require('../middleware/authMiddleware');
const slugify = require('slugify');
const Tag = require('../models/tagModel');
const Spot = require('../models/spotModel');



const tagCreate = async (parent, args, context) => {
    if (args.input.name.trim() === '') throw new Error('Name is required');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const tag = await new Tag({
        ...args.input,
        slug: slugify(args.input.name.trim().toLowerCase())
    }).save();

    return tag;
}



const allTags = async (parent, args, context) => {
    const tags = await Tag.find();
    return tags;
}



const tagDelete = async (parent, args, context) => {
    if (!args.input.slug) throw new Error('Tag identifier (slug) is required');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const tag = await Tag.findOne({slug: args.input.slug});
    const spots = await Spot.find({tags: tag._id});
    if (spots) {
        for (let i = 0; i < spots.length; i++) {
            let updateResponse = await Spot.updateMany({tags: tag._id}, {$pull: {tags: tag._id}});
            console.log(updateResponse); //would not hurt to throw error if Spot.updateMany() fails
        }
    }

    const deletedTag = await Tag.findOneAndRemove({slug: args.input.slug});
    if (!deletedTag.slug) throw new Error('Tag not found');
    return deletedTag;
}



const getTag = async (parent, args, context) => { //get Tag by slug
    if (!args.slug) throw new Error('Tag idnetifier (slug) is required');
    
    const tag = await Tag.findOne({slug: args.slug});
    if (!tag || !tag.slug) throw new Error('Tag not found');
    return tag;
}



const tagUpdate = async (parent, args, context) => {
    if (!args.input.slug) throw new Error('Tag identifier (slug) is required');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const updatedTag = await Tag.findOneAndUpdate({slug: args.input.slug}, {...args.input, slug: slugify(args.input.name.trim().toLowerCase())}, {new: true});
    if (!updatedTag || !updatedTag.slug) {
        throw new Error('Tag not found')
    }

    return updatedTag;
}



module.exports = {
    Query: {
        allTags,
        getTag
    },
    Mutation: {
        tagCreate,
        tagDelete,
        tagUpdate
    }
};