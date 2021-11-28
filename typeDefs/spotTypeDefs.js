const { gql } = require('apollo-server-express');



module.exports = gql`
    #SCALARS
    scalar DateTime
    #INPUTS
    input ImageInput {
        url: String
        public_id: String
    }
    input SpotCreateInput {
        name: String!
        where: String
        highlight: String!
        description: String
        category: String!
        tags: [String]
        lat: String!
        long: String!
        postedBy: String!
        images: [ImageInput]
    }
    input spotEditInput {
        name: String!
        where: String
        highlight: String!
        description: String
        category: String!
        tags: [String]
        lat: String!
        long: String!
        postedBy: String!
        images: [ImageInput]
        slug: String!
        likes: [String]
    }
    input spotDeleteInput {
        slug: String!
        postedBy: String!
    }
    input SpotLikeInput {
        slug: String!
    }
    input SearchSpotsInput {
        page: Int
        searchword: String
        category: String
        tag: String
        sortBy: String
        postedBy: String
    }
    input UsersSpotsInput {
        username: String!
    }
    #TYPES
    type SpotCreateResponse {
        name: String!
        slug: String!
        where: String
        highlight: String!
        description: String
        category: String!
        tags: [String]
        lat: String!
        long: String!
        postedBy: String!
        _id: ID
        createdAt: DateTime
    }
    type Image {
        url: String!
        public_id: String!
    }
    type Category {
        name: String!
        _id: ID
    }
    type Tag {
        image: Image
        name: String
        _id: ID
    }
    type Spot {
        name: String!
        slug: String!
        where: String
        highlight: String!
        description: String
        category: Category!
        tags: [Tag]
        lat: String!
        long: String!
        postedBy: String!
        _id: ID
        createdAt: DateTime
        updatedAt: DateTime
        images: [Image!]
        username: String
        likes: [String]
    }
    type SpotSearchResponse {
        spots: [Spot]
        page: Int
        numberOfPages: Int
    }
    type DeletedSpotCategory {
        _id: ID
    }
    type DeletedSpotTag {
        _id: ID
    }
    type SpotDeleteResponse {
        name: String!
        slug: String!
        where: String
        highlight: String!
        description: String
        category: DeletedSpotCategory
        tags: [DeletedSpotTag]
        _id: ID
        createdAt: DateTime
        updatedAt: DateTime
        images: [Image]
        username: String
        likes: [String]
        postedBy: String
    }
    #MUTATIONS
    type Mutation {
        spotCreate(input: SpotCreateInput!): SpotCreateResponse!
        spotEdit(input: spotEditInput!): SpotCreateResponse!
        spotDelete(input: spotDeleteInput!): SpotDeleteResponse
        spotLike(input: SpotLikeInput!): Spot! 
    }
    #QUERIES
    type Query {
        getSpot(slug: String!): Spot!
        totalSpots: Int!
        allSpots(input: Int): [Spot!]
        searchSpots(input: SearchSpotsInput): SpotSearchResponse
        usersSpots(input: UsersSpotsInput): [Spot!]
    }
`;



