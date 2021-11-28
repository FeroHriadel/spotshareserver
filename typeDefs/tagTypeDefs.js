const { gql } = require('apollo-server-express');



module.exports = gql`
    #SCALARS
    scalar DateTime
    #TYPES
    type Image {
        url: String
        public_id: String
    }
    type Tag {
        _id: ID
        name: String!
        slug: String!
        image: Image
        createdAt: DateTime
        updatedAt: DateTime
    }
    type TagCreateResponse {
        name: String!
        slug: String!
        image: Image!
        _id: ID
        createdAt: DateTime
        updatedAt: DateTime
    }
    #INPUTS
    input ImageInput {
        url: String
        public_id: String
    }
    input TagCreateInput {
        name: String!
        image: ImageInput!
    }
    input TagDeleteInput {
        slug: String!
    }
    input TagUpdateInput {
        slug: String!
        name: String!
        image: ImageInput
    }
    #QUERIES
    type Query {
        allTags: [Tag!]!
        getTag(slug: String!): Tag!
    }
    #MUTATIONS
    type Mutation {
        tagCreate(input: TagCreateInput!): TagCreateResponse!
        tagDelete(input: TagDeleteInput!): Tag!
        tagUpdate(input: TagUpdateInput!): Tag!
    }
`;