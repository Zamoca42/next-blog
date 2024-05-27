import { getAllPosts, getPostBySlug } from "@/lib/api";

export const resolvers = {
  Query: {
    posts: () => getAllPosts(),
    // post: (slug: string) => getPostBySlug(slug),
    post: (_: unknown, { slug }: { slug: string }) => getPostBySlug(slug),
  },
};
