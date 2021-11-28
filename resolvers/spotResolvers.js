const { gql } = require('apollo-server-express');
const { DateTimeResolver } = require('graphql-scalars');
const { authCheck, adminCheck } = require('../middleware/authMiddleware');
const slugify = require('slugify');
const Category = require('../models/categoryModel');
const Tag = require('../models/tagModel');
const User = require('../models/userModel');
const Spot = require('../models/spotModel');




const spotCreate = async (parent, args, context) => {
    const user = await authCheck(context.req);
    if (user.error) {
        console.log('Unauthorized')
        throw new Error('Unauthorized');
    }

    if (!args.input.postedBy || args.input.postedBy.trim() === '') {
        console.log('Author is required');
        throw new Error('Author is required');
    }

    if (args.input.postedBy.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
        console.log('Firebase user & postedBy do not match');
        throw new Error('Firebase user & postedBy do not match');
    }

    if (
        !args.input.name || args.input.name.trim() === ''
        ||
        !args.input.images || args.input.images === []
        ||
        !args.input.highlight || args.input.highlight.trim() === ''
        ||
        !args.input.category || args.input.category === ''
        ||
        !args.input.lat
        ||
        !args.input.long
    ) {
        console.log('Name, Image(s), highlight, GPS (and author) are required');
        throw new Error('Name, Image(s), highlight, GPS (and author) are required');
    }

    const spot = await new Spot({...args.input, slug: slugify(args.input.name.trim().toLowerCase())}).save();    
    return spot;
}



const getSpot = async (parent, args, context) => { //get spot by slug
    if (!args.slug) throw new Error('Spot idnetifier (slug) is required');
    
    const spot = await Spot.findOne({slug: args.slug}).populate('category', 'name').populate('tags', 'image name');

    if (!spot || !spot.slug) throw new Error('Spot not found');

    //populate    spot.username = user.username   so frontend can display who posted it
    const user = await User.findOne({email: spot.postedBy});
    spot.username = user ? user.username : ''; //user should always be found but just in case...

    return spot;
}



const totalSpots = async (parent, args, context) => {
    return await Spot.find({}).estimatedDocumentCount().exec();
}



const allSpots = async (parent, args, context) => {
    const currentPage = args.input || 1;
    const perPage = 3;

    return await Spot.find({})
        .skip((currentPage - 1) * perPage)
        .populate('category', 'name')
        .populate('tags', 'image name')
        .limit(perPage)
        .sort({createdAt: -1})
        .exec()
}



const spotEdit = async (parent, args, context) => {
    const user = await authCheck(context.req);
    if (user.error) {
        console.log('Unauthorized')
        throw new Error('Unauthorized');
    }

    if (!args.input.postedBy) {
        console.log('Author is required');
        throw new Error('Author is required');
    }

    const userFromDb = await User.findOne({email: user.email});
    if (!userFromDb) throw new Error('Unauthorized');

    if (userFromDb.role !== 'admin') {
            if (user.email.trim() !== args.input.postedBy.trim()) {
            console.log('USER EMAIL: ', user.email, typeof user.email);
            console.log('POSTEDBY: ', args.input.postedBy, typeof args.input.postedBy);
            throw new Error('Unauthorized. Only the author or admin can edit the spot.');
        }
    }

    if (!args.input.slug) throw new Error('Spot identifier (slug) not found');

    if (
        !args.input.name || args.input.name.trim() === ''
        ||
        !args.input.images || args.input.images === []
        ||
        !args.input.highlight || args.input.highlight.trim() === ''
        ||
        !args.input.category || args.input.category === ''
        ||
        !args.input.lat
        ||
        !args.input.long
    ) {
        console.log('Name, Image(s), highlight, GPS are required');
        throw new Error('Name, Image(s), highlight, GPS are required');
    }

    const updatedSpot = await Spot.findOneAndUpdate({slug: args.input.slug}, {...args.input}, {new: true});
    if (!updatedSpot) throw new Error('Spot update failed');
    
    return updatedSpot;
}



const spotDelete = async (parent, args, context) => {
    const user = await authCheck(context.req);
    if (user.error) {
        console.log('Unauthorized')
        throw new Error('Unauthorized');
    }

    if (
        !args.input.slug || args.input.slug.trim() === ''
        || !args.input.postedBy || args.input.postedBy.trim() === ''
    ) {
        console.log(`BAD INPUT! postedBy: ${args.input.postedBy}, slug: ${args.input.slug}`);
        throw new Error('Author and spot identifier (slug) are required');
    }

    const spot = await Spot.findOne({slug: args.input.slug});
    if (!spot) throw new Error('Spot not found');

    const userFromDb = await User.findOne({email: user.email});
    if (!userFromDb) throw new Error('Unauthorized');

    if (userFromDb.role !== 'admin') {
            if (user.email.trim() !== args.input.postedBy.trim()) {
            console.log('USER EMAIL: ', user.email, typeof user.email);
            console.log('POSTEDBY: ', args.input.postedBy, typeof args.input.postedBy);
            throw new Error('Unauthorized. Only the author or admin can delete the spot.');
        }
    }

    const deletedSpot = await spot.remove();
    if (!deletedSpot) throw new Error('Spot delete failed');

    console.log(typeof deletedSpot.category)

    return deletedSpot;
}



const spotLike = async (parent, args, context) => { //get spot by slug
    const user = await authCheck(context.req);
    if (user.error) {
        console.log('Unauthorized')
        throw new Error('Unauthorized');
    }

    if (!args.input.slug || args.input.slug.trim() === '') throw new Error('Spot identifier (slug) is required');

    // I decided to store user.email rather than user._id => saves one call, might have security consequences
    // const userFromDb = await User.findOne({email: user.email});
    // if (!userFromDb) throw new Error('User could not be verified');

    const spot = await Spot.findOne({slug: args.input.slug});
    if (!spot || !spot.slug) throw new Error('Spot not found');

    const likes = spot.likes;
    if (likes.includes(`${user.email}`)) throw new Error('You already liked this spot');
    likes.push(user.email);
    const updatedSpot = await Spot.findOneAndUpdate({slug: args.input.slug}, {$set: {likes: likes}}, {new: true}).populate('category', 'name').populate('tags', 'image name');

    return updatedSpot;
}



const searchSpots = async (parent, args, context) => {
    const perPage = 5;
    const page = Number(args.input.page) || 1;

    const searchword = args.input.searchword ? {name: {$regex: args.input.searchword, $options: 'i'}} : {};
    const category = args.input.category ? {category: args.input.category} : {}
    const tag = args.input.tag ? {tags: args.input.tag} : {};
    let postedBy = args.input.postedBy ? {postedBy: {$regex: args.input.postedBy, $options: 'i'}} : {};
    const sortBy = args.input.sortBy && args.sortBy === 'recent' 
        ? 
        [['createdAt', 'desc']] 
        : 
        args.input.sortBy && args.input.sortBy === 'alphabetically'
        ?
        [['name', 'asc']]
        :
        [['createdAt', 'asc']];
    
    let spotsTotal = await Spot.countDocuments({...searchword, ...category, ...tag, ...postedBy});
    let spots = await Spot.find({...searchword, ...category, ...tag, ...postedBy})
        .populate('category', 'name')
        .populate('tags', 'image name')
        .sort(sortBy)
        .limit(perPage)
        .skip((page - 1) * perPage);


        //if (postedBy && !spots) user might be looking for spots by user.username rather than user.email:
          //try and find user with such username, fetch their email, and run the search once more
          // and plan your architecture before starting coding next time, will you...
        if (Array.isArray(spots) && spots.length === 0 && postedBy !== {}) {
            const possibleUser = await User.findOne({username: {$regex: args.input.postedBy, $options: 'i'}});
            if (possibleUser) {
                postedBy = {postedBy: {$regex: possibleUser.email, $options: 'i'}};

                spotsTotal = await Spot.countDocuments({...searchword, ...category, ...tag, ...postedBy});
                spots = await Spot.find({...searchword, ...category, ...tag, ...postedBy})
                    .populate('category', 'name')
                    .populate('tags', 'image name')
                    .sort(sortBy)
                    .limit(perPage)
                    .skip((page - 1) * perPage);
            }
        }


    if (!spots) throw new Error('No spots matching your criteria found');

    return {spots: spots, page: page, numberOfPages: Math.ceil(spotsTotal/perPage)}
}



const usersSpots = async (parent, args, context) => {
    const username = args.input.username;
    if (!username || username.trim() === '') throw new Error('Username not provided');

    const user = await User.findOne({username});
    if (!user) throw new Error('User not found');

    const spots = await Spot.find({postedBy: user.email})
        .populate('category', 'name')
        .populate('tags', 'image name');
        
    if (!spots) throw new Error('No spots found');

    return spots
}



module.exports = {
    Query: {
        getSpot,
        totalSpots,
        allSpots,
        searchSpots,
        usersSpots
    },
    Mutation: {
        spotCreate,
        spotEdit,
        spotDelete,
        spotLike
    }
};