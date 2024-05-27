// Next.js Custom Route Handler: https://nextjs.org/docs/app/building-your-application/routing/router-handlers
import { createSchema, createYoga } from "graphql-yoga";
import { getAllPosts, getPostBySlug } from "@/lib/api";

export const resolvers = {
  Query: {
    posts: () => getAllPosts(),
    // post: (slug: string) => getPostBySlug(slug),
    post: (_: unknown, { slug }: { slug: string }) => getPostBySlug(slug),
  },
};

const { handleRequest } = createYoga({
  graphiql: process.env.NODE_ENV === "development",
  schema: createSchema({
    typeDefs: /* GraphQL */ `
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
    `,
    resolvers: resolvers,
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
