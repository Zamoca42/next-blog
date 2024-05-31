export const typeDefs = /* GraphQL */ `
  type Url {
    url: String!
  }

  type Post {
    title: String!
    date: String!
    tags: [String!]!
    slug: String!
    content: String!
    coverImage: String
    author: Author!
    excerpt: String!
    ogImage: Url!
    preview: Boolean
  }

  type Folder {
    id: ID!
    name: String!
    path: String!
    children: [Folder]
  }

  type Author {
    name: String!
    picture: String!
  }

  type Query {
    posts(prefix: String): [Post!]!
    post(slug: String!): Post
    folders(path: String): [Folder]
  }
`;
