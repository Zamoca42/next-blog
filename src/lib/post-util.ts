import fs from "fs/promises";
import matter from "gray-matter";
import { Post } from "@/interface/post";
import { formatISO, parseISO } from "date-fns";
import { join } from "path";
import {
  getMarkdownFiles,
  getSlugFromFilePath,
  readGitInfo,
  postsDirectory,
} from "@/lib/file-util";
import { PostHistory } from "@/interface/post-history";

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const [markdownFiles, gitInfo] = await Promise.all([
      getMarkdownFiles(postsDirectory),
      readGitInfo(),
    ]);

    const posts = await Promise.all(
      markdownFiles.map(async (file) => {
        const post = await parsePostContent(file);
        return applyPostHistory(post, gitInfo);
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
    const gitInfo = await readGitInfo();
    if (!gitInfo[slug]) return null;

    const post = await parsePostContent(`${slug}.md`);
    return applyPostHistory(post, gitInfo);
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
};

export const parsePostContent = async (filePath: string): Promise<Post> => {
  const fullPath = join(postsDirectory, filePath);
  const slug = getSlugFromFilePath(filePath);
  const fileContents = await fs.readFile(fullPath, "utf8");

  const { data, content, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  return {
    slug,
    content,
    excerpt: excerpt || "",
    title: String(data.title),
    description: data.description,
    createdAt: data.date,
    updatedAt: data.date,
    tags: data.tag ?? [],
    star: Boolean(data.star),
  };
};

const applyPostHistory = (
  post: Post,
  gitInfo: Record<string, PostHistory>
): Post => {
  const fallbackDate = formatISO(new Date());
  const postHistory = gitInfo[post.slug];

  return {
    ...post,
    createdAt: post.createdAt || postHistory.createdAt || fallbackDate,
    updatedAt: postHistory.updatedAt || fallbackDate,
  };
};