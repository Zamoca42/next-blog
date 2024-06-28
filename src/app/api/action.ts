import { getAllPosts, getPostBySlug } from "@/lib/post-util";
import { getSpecificTreeNode, getAllTreeNode } from "@/lib/tree-util";
import { unstable_cache as nextCache } from "next/cache";

export { getAllPosts, getPostBySlug, getSpecificTreeNode, getAllTreeNode };

export const getCachedPosts = nextCache(async () => await getAllPosts(), ["posts"], {
  revalidate: 3600,
});
