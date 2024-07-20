import fs from "fs/promises";
import matter from "gray-matter";
import { Post } from "@/interface/post";
import { PostHistory } from "@/interface/post-history";
import { formatISO, parseISO } from "date-fns";
import { join, relative } from "path";
import {
  getMarkdownFiles,
  getSlugFromFilePath,
  readGitInfo,
  postsDirectory,
} from "@/lib/file-util";
import { existsSync } from "fs";

export const parsePostContent = async (
  filePath: string,
  gitInfo: Record<string, PostHistory>
): Promise<Post> => {
  const fullPath = join(postsDirectory, filePath);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const fallbackDate = formatISO(new Date());
  const { data, content, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  const relativeFilePath = relative(process.cwd(), fullPath);
  const postDate = data.date ? formatISO(new Date(data.date)) : undefined;
  const { createdAt, updatedAt } = gitInfo[relativeFilePath] || {
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  };

  const slug = getSlugFromFilePath(filePath);

  return {
    ...data,
    slug,
    content,
    excerpt,
    createdAt: postDate || createdAt,
    updatedAt,
    tags: data.tag ?? [],
    star: Boolean(data.star),
  } as Post;
};

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const [markdownFiles, gitInfo] = await Promise.all([
      getMarkdownFiles(postsDirectory),
      readGitInfo(),
    ]);

    const posts = await Promise.all(
      markdownFiles.map((file) => parsePostContent(file, gitInfo))
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
    const filePath = join("content", `${slug}.md`);

    if (!existsSync(filePath)) return null;

    const gitInfo = await readGitInfo();
    return parsePostContent(`${slug}.md`, gitInfo);
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
};