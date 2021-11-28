const { gql } = require('apollo-server-express');



module.exports = gql`
    #SCALARS
    scalar DateTime
    #INPUTS
    input CommentImageInput {
        url: String
        public_id: String
    }
    input CommentCreateInput {
        spotSlug: String!
        image: CommentImageInput
        content: String!
    }
    input GetCommentsInput {
        spotSlug: String!
        page: Int
    }
    input CommentDeleteInput {
        _id: ID
    }
    #TYPES
    type CommentImage {
        url: String
        public_id: String
    }
    type CommentedBy {
        _id: ID!
        username: String!
    }
    type Comment {
        spotSlug: String!
        image: CommentImage
        content: String!
        commentedBy: CommentedBy!
        createdAt: DateTime
        _id: ID
    }
    type GetCommentsResponse {
        comments: [Comment]
        page: Int
        numberOfPages: Int
    }
    #MUTATIONS
    type Mutation {
        commentCreate(input: CommentCreateInput!): Comment
        commentDelete(input: CommentDeleteInput!): Comment
    }
    type Query {
        getComments(input: GetCommentsInput): GetCommentsResponse
    }
`;