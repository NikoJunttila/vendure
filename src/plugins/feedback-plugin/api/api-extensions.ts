import gql from 'graphql-tag';

export const commonExtensions = gql`
  type Feedback {
    id: ID!
    feedback: String!
    rating: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateFeedbackInput {
    feedback: String!
    rating: Int!
  }
`;

export const adminApiExtensions = gql`
  ${commonExtensions}

  extend type Query {
    feedbacks: [Feedback!]!
  }
  
  extend type Mutation {
    createFeedback(input: CreateFeedbackInput!): Feedback!
    removeFeedback(id: ID!): Boolean!
  }
  
  input UpdateFeedbackInput {
    id: ID!
    feedback: String!
    rating: Int!
  }
`;

export const shopApiExtensions = gql`
  ${commonExtensions}

  extend type Query {
    feedbacks: [Feedback!]!
  }
  
  extend type Mutation {
    createFeedback(input: CreateFeedbackInput!): Feedback!
  }
`;
