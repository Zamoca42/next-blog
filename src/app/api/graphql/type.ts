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

  type Author {
    name: String!
    picture: String!
  }

  type Query {
    posts: [Post!]!
    post(slug: String!): Post
  }
`;