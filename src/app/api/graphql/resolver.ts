import { Folder } from "@/interface/folder";
import { getAllPosts, getPostBySlug, getTopLevelFolders } from "@/lib/api";

export const resolvers = {
  Query: {
    posts: (_: unknown, { prefix }: { prefix?: string }) => {
      const allPosts = getAllPosts();
      if (prefix) {
        return allPosts.filter((post) => post.folders[0] === prefix);
      }
      return allPosts;
    },
    // post: (slug: string) => getPostBySlug(slug),
    post: (_: unknown, { slug }: { slug: string }) => getPostBySlug(slug),
    folders: () => getTopLevelFolders(),
  },
  Folder: {
    posts: (folder: Folder) => {
      const allPosts = getAllPosts();
      return allPosts.filter((post) => post.folders[0] === folder.path);
    },
  },
};
