import gql from 'graphql-tag';

const timeslotEntityAdminApiExtensions = gql`
  type TimeslotEntity implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    code: String!
  }

  type TimeslotEntityList implements PaginatedList {
    items: [TimeslotEntity!]!
    totalItems: Int!
  }

  # Generated at run-time by Vendure
  input TimeslotEntityListOptions

  extend type Query {
    timeslotEntity(id: ID!): TimeslotEntity
    timeslotEntitys(options: TimeslotEntityListOptions): TimeslotEntityList!
  }

  input CreateTimeslotEntityInput {
    code: String!
  }

  input UpdateTimeslotEntityInput {
    id: ID!
    code: String
  }

  extend type Mutation {
    createTimeslotEntity(input: CreateTimeslotEntityInput!): TimeslotEntity!
    updateTimeslotEntity(input: UpdateTimeslotEntityInput!): TimeslotEntity!
    deleteTimeslotEntity(id: ID!): DeletionResponse!
  }
`;
const timeslotEntityShopApiExtensions = gql`
  type TimeslotEntity implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    code: String!
  }

  type TimeslotEntityList implements PaginatedList {
    items: [TimeslotEntity!]!
    totalItems: Int!
  }

  # Generated at run-time by Vendure
  input TimeslotEntityListOptions

  extend type Query {
    timeslotEntity(id: ID!): TimeslotEntity
    timeslotEntitys(options: TimeslotEntityListOptions): TimeslotEntityList!
  }
`
export const adminApiExtensions = gql`
  ${timeslotEntityAdminApiExtensions}
`;
export const shopApiExtensions = gql`
${timeslotEntityShopApiExtensions}
`