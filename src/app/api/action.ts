"use server";

import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { capitalize } from "../../lib/util";
import { formatISO, parseISO } from "date-fns";
import { exec } from "child_process";

const postsDirectory = join(process.cwd(), "content");

export const getAllPosts = async (): Promise<Post[]> => {
  const postMap = await createIndex(postsDirectory);
  const posts = getPostsFromIndex(postMap);

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

const createIndex = async (directory: string): Promise<Map<string, Post>> => {
  const postMap = new Map<string, Post>();
  const stack: string[] = [directory];

  while (stack.length > 0) {
    const currentDirectory = stack.pop()!;
    const fileNames = await fs.promises.readdir(currentDirectory);

    for (const fileName of fileNames) {
      const filePath = join(currentDirectory, fileName);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        stack.push(filePath);
      } else if (fileName.endsWith(".md")) {
        const slug = getSlugFromFilePath(filePath);
        const post = await getPostBySlug(slug);
        postMap.set(slug, post);
      }
    }
  }

  return postMap;
};

const getPostsFromIndex = (postMap: Map<string, Post>): Post[] => {
  return Array.from(postMap.values());
};

const getTreeNode = async (
  directory: string,
  parentId: string = ""
): Promise<ContentFolder[]> => {
  const fileNames = await fs.promises.readdir(directory);
  const folderList: ContentFolder[] = [];

  const entries = Array.from(fileNames.entries());
  for (let i = 0; i < entries.length; i++) {
    const [index, fileName] = entries[i];
    const filePath = join(directory, fileName);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const id = `${parentId}${index + 1}`;
      const children = await getTreeNode(filePath, id);
      folderList.push({
        id,
        path: fileName,
        name: capitalize(fileName),
        children,
      });
    } else if (fileName.endsWith(".md")) {
      const id = `${parentId}${index + 1}`;
      const slug = getSlugFromFilePath(filePath);
      const post = await getPostBySlug(slug);
      folderList.push({
        id,
        path: post.slug,
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
  const { data, content } = matter(fileContents);

  const { createdAt, updatedAt } =
    process.env.NODE_ENV === "development"
      ? await getFileDates(fullPath)
      : await getGitDates(fullPath);

  return {
    ...data,
    slug,
    content,
    tags: data.tags ?? [],
    category: data.category ?? [],
    createdAt,
    updatedAt,
  } as Post;
};

const getFileDates = async (
  filePath: string
): Promise<{ createdAt: string; updatedAt: string }> => {
  const stat = await fs.promises.stat(filePath);
  const createdAt = formatISO(stat.birthtime);
  const updatedAt = formatISO(stat.mtime);
  return { createdAt, updatedAt };
};

const getGitDates = async (
  filePath: string
): Promise<{ createdAt: string; updatedAt: string }> => {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;

  const gitLogFileDate = async (command: string) => {
    const outputDate = await new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });

    return formatISO(new Date(outputDate));
  };

  const [createdAt, updatedAt] = await Promise.all([
    gitLogFileDate(createdAtCommand),
    gitLogFileDate(updatedAtCommand),
  ]);

  return { createdAt, updatedAt };
};
