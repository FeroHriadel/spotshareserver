const { gql } = require('apollo-server-express');



module.exports = gql`
    #SCALARS
    scalar DateTime
    #TYPES
    type Category {
        _id: ID
        name: String!
        slug: String!
        about: String,
        createdAt: DateTime
        updatedAt: DateTime
    }
    type CategoryCreateResponse {
        name: String!
        slug: String!
        about: String
    }
    #INPUTS
    input CategoryCreateInput {
        name: String!
        about: String
    }
    input CategoryDeleteInput {
        slug: String!
    }
    input CategoryUpdateInput {
        slug: String!
        name: String!
        about: String
    }
    #QUERIES
    type Query {
        allCategories: [Category!]!
        getCategory(slug: String!): Category!
    }
    #MUTATIONS
    type Mutation {
        categoryCreate(input: CategoryCreateInput!): CategoryCreateResponse
        categoryDelete(input: CategoryDeleteInput!): Category!
        categoryUpdate(input: CategoryUpdateInput!): Category!
    }
`;