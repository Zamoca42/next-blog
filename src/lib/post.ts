import { Post } from "@/interface/post";
import { formatISO, parseISO } from "date-fns";
import { join } from "path";
import {
  ParsedPost,
  getMarkdownFiles,
  parsePostContent as parsePostContentJS,
  postsDirectory,
} from "@/lib/file-meta";
import postIndex from "../../public/post-index.json";
import { PostMetadata } from "@/script/post-index";

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const markdownFiles = await getMarkdownFiles(postsDirectory);
    const posts = await Promise.all(
      markdownFiles.map(async (file) => {
        const post = await parsePostContent(file);
        return applyPostHistory(post, postIndex);
      })
    );

    return posts.sort((post1, post2) => {
      const date1 = post1.createdAt ? parseISO(post1.createdAt) : new Date();
      const date2 = post2.createdAt ? parseISO(post2.createdAt) : new Date();
      return date2.getTime() - date1.getTime();
    });
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const post = await parsePostContent(`${slug}.md`);
    return applyPostHistory(post, postIndex);
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
};

const parsePostContent = async (filePath: string): Promise<ParsedPost> => {
  const fullPath = join(postsDirectory, filePath);
  return parsePostContentJS(fullPath);
};

const applyPostHistory = (
  post: ParsedPost,
  postGitInfo: Record<string, PostMetadata>
): Post => {
  const postHistory = postGitInfo[post.slug];
  const fallbackDate = formatISO(new Date());
  return {
    ...post,
    createdAt: post.createdAt || postHistory?.createdAt || fallbackDate,
    updatedAt: post.updatedAt || postHistory?.updatedAt || fallbackDate,
  };
};
