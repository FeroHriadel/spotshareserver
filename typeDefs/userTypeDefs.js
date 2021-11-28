const { gql } = require('apollo-server-express');



module.exports = gql`
    #SCALARS
    scalar DateTime
    #TYPES
    type Image {
        url: String
        public_id: String
    }
    type User {
        _id: ID
        username: String
        email: String
        about: String
        image: Image
        role: String
        createdAt: DateTime
        updatedAt: DateTime
    }
    type UserCreateResponse {
        username: String!
        email: String
        role: String
    }
    #INPUTS
    input ImageInput {
        url: String
        public_id: String
    }
    input UserUpdateInput {
        username: String
        about: String
        image: ImageInput
    }
    input publicProfileInput {
        username: String!
    }
    #QUERIES
    type Query {
        placeholderQuery: String
        profile: User!
        getUsers: [User]
        publicProfile(input: publicProfileInput): User!
    }
    #MUTATIONS
    type Mutation {
        userCreate: UserCreateResponse!
        userUpdate(input: UserUpdateInput): User
    }
`;