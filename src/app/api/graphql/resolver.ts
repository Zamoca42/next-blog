import { getAllPosts, getAllTreeNode, getPostBySlug } from "@/app/api/action";

export const resolvers = {
  Query: {
    posts: async (_: unknown, { prefix }: { prefix: string }) => {
      const allPosts = await getAllPosts();
      if (prefix) {
        return allPosts.filter((post) => post.slug.split("/").includes(prefix));
      }
      return allPosts;
    },
    post: (_: unknown, { slug }: { slug: string }) => getPostBySlug(slug),
    folders: async (_: unknown, { path }: { path: string }) => {
      const allFolders = await getAllTreeNode();
      if (path) {
        return allFolders.filter((folder) => folder.path === path);
      }
      return allFolders;
    },
  },
};
