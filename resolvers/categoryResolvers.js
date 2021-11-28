const { gql } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { adminCheck } = require('../middleware/authMiddleware');
const slugify = require('slugify');
const Category = require('../models/categoryModel');
const Spot = require('../models/spotModel');
const Comment = require('../models/commentModel');




const categoryCreate = async (parent, args, context) => {
    if (args.input.name.trim() === '') throw new Error('Name is required');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const category = await new Category({
        ...args.input,
        slug: slugify(args.input.name.trim().toLowerCase())
    }).save();

    return category;
}



const allCategories = async (parent, args, context) => {
    const categories = await Category.find();
    return categories;
}



const categoryDelete = async (parent, args, context) => {
    if (!args.input.slug) throw new Error('Category identifier (slug) is required');
    if (
        args.input.slug === 'urban'
        ||
        args.input.slug === 'rustic'
        ||
        args.input.slug === 'outdoors'
        ) throw new Error('Categories: urban, rustic and outdoors are an integral part of the app and cannot be deleted');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const category = await Category.findOne({slug: args.input.slug});
    if (!category) throw new Error('Category not found');

    const spotsToDelete = await Spot.find({category: category._id});
    if (spotsToDelete) {
        for (let i = 0; i < spotsToDelete.length; i++) {
            await Comment.deleteMany({spotSlug: spotsToDelete[i].slug});
            //if comment has a cloudinary img the img stays in cloudinary
        }
    }

    await Spot.deleteMany({category: category._id});
    //cloudinary images remain in cloudinary

    const deletedCategory = await Category.findOneAndRemove({slug: args.input.slug});
    if (!deletedCategory.slug) throw new Error('Category not found');
    return deletedCategory;
}



const getCategory = async (parent, args, context) => { //get Categoiry by slug
    if (!args.slug) throw new Error('Category idnetifier (slug) is required');
    
    const category = await Category.findOne({slug: args.slug});
    if (!category || !category.slug) throw new Error('Category not found');
    return category;
}



const categoryUpdate = async (parent, args, context) => {
    if (!args.input.slug) throw new Error('Category identifier (slug) is required');
    if (
        args.input.slug === 'urban'
        ||
        args.input.slug === 'rustic'
        ||
        args.input.slug === 'outdoors'
        ) throw new Error('Categories: urban, rustic and outdoors are an integral part of the app and cannot be modified');

    const user = await adminCheck(context.req);
    if (user.error) {
        throw new Error('Unauthorized');
    }

    const updatedCategory = await Category.findOneAndUpdate({slug: args.input.slug}, {...args.input, slug: slugify(args.input.name.trim().toLowerCase())}, {new: true});
    if (!updatedCategory || !updatedCategory.slug) {
        throw new Error('Category not found')
    }

    return updatedCategory;
}



module.exports = {
    Query: {
        allCategories,
        getCategory,
    },
    Mutation: {
        categoryCreate,
        categoryDelete,
        categoryUpdate
    }
};