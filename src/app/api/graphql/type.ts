export const typeDefs = /* GraphQL */ `
  type Post {
    title: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    tags: [String!]!
    category: String!
    slug: String!
    content: String!
    description: String!
  }

  type Folder {
    id: ID!
    name: String!
    path: String!
    children: [Folder]
  }

  type Query {
    posts(prefix: String): [Post!]!
    post(slug: String!): Post
    folders(path: String): [Folder]
  }
`;
