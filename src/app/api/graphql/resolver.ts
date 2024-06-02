import { getAllPosts, getAllTreeNode, getPostBySlug } from "@/lib/api";

export const resolvers = {
  Query: {
    posts: (_: unknown, { prefix }: { prefix: string }) => {
      const allPosts = getAllPosts();
      if (prefix) {
        return allPosts.filter((post) => post.slug.split("/").includes(prefix));
      }
      return allPosts;
    },
    post: (_: unknown, { slug }: { slug: string }) => getPostBySlug(slug),
    folders: (_: unknown, { path }: { path: string }) => {
      const allFolders = getAllTreeNode();
      if (path) {
        return allFolders.filter((folder) => folder.path === path);
      }
      return allFolders;
    },
  },
};
