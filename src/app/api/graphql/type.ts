export const typeDefs = /* GraphQL */ `
  type Post {
    title: String!
    createdAt: String!
    updatedAt: String!
    tags: [String!]!
    slug: String!
    content: String!
    description: String
    star: Boolean!
    excerpt: String
  }

  type Folder {
    id: String!
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
