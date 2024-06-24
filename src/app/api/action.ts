"use server";

import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import fs from "fs";
import matter from "gray-matter";
import { join, relative } from "path";
import { capitalizeAfterHyphen } from "@/lib/util";
import { formatISO, parseISO } from "date-fns";
import { GIT_HSITORY_FILE_NAME, POST_CONTENT_FOLDER } from "@/lib/constant";
import { PostHistory } from "@/interface/post-history";

const postsDirectory = join(process.cwd(), POST_CONTENT_FOLDER);
const gitInfoPath = join(process.cwd(), "public", GIT_HSITORY_FILE_NAME);

const readGitInfo = (): Record<string, PostHistory> => {
  const gitInfoData = fs.readFileSync(gitInfoPath, "utf8");
  return JSON.parse(gitInfoData);
};

export const getAllPosts = async (): Promise<Post[]> => {
  const fileNames = await fs.promises.readdir(postsDirectory, {
    recursive: true,
  });

  const posts: Post[] = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = join(postsDirectory, fileName);
      const slug = getSlugFromFilePath(filePath);
      const post = await getPostBySlug(slug);
      posts.push(post);
    }
  }

  return posts.sort((post1, post2) => {
    const date1 = post1.createdAt ? parseISO(post1.createdAt) : new Date();
    const date2 = post2.createdAt ? parseISO(post2.createdAt) : new Date();
    return date2.getTime() - date1.getTime();
  });
};

export const getAllTreeNode = async (): Promise<ContentFolder[]> => {
  const folders = await getTreeNode(postsDirectory);
  return folders;
};

const getTreeNode = async (
  directory: string,
  parentId: string = ""
): Promise<ContentFolder[]> => {
  const fileNames = await fs.promises.readdir(directory);
  const folderList: ContentFolder[] = [];

  const sortedFileNames = fileNames.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  for (let i = 0; i < sortedFileNames.length; i++) {
    const fileName = sortedFileNames[i];
    const filePath = join(directory, fileName);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const id = `${parentId}${i + 1}`;
      const children = await getTreeNode(filePath, id);
      folderList.push({
        id,
        path: fileName,
        name: capitalizeAfterHyphen(fileName),
        children,
      });
    } else if (fileName.endsWith(".md")) {
      const id = `${parentId}${i + 1}`;
      const slug = getSlugFromFilePath(filePath);
      const post = await getPostBySlug(slug);
      folderList.push({
        id,
        path: post.slug,
        order: post.order ?? Infinity,
        name: post.title,
        children: [],
      });
    }
  }

  return folderList;
};

const getSlugFromFilePath = (filePath: string): string => {
  return filePath
    .replace(postsDirectory, "")
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
};

export const getPostBySlug = async (slug: string): Promise<Post> => {
  const fullPath = join(postsDirectory, `${slug}.md`);
  const fileContents = await fs.promises.readFile(fullPath, "utf8");
  const fallbackDate = formatISO(new Date());
  const { data, content, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  const gitInfo = readGitInfo();
  const relativeFilePath = relative(process.cwd(), fullPath);
  const postDate = data.date ? formatISO(new Date(data.date)) : undefined;
  const { createdAt, updatedAt } = gitInfo[relativeFilePath] || {
    createdAt: fallbackDate,
    updatedAt: fallbackDate,
  };

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
