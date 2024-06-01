import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { capitalize } from "./util";
import { formatISO, parseISO } from "date-fns";

const postsDirectory = join(process.cwd(), "content");

export const getAllPosts = (): Post[] => {
  const postMap = createIndex(postsDirectory);
  const posts = getPostsFromIndex(postMap);

  return posts.sort((post1, post2) => {
    const date1 = parseISO(post1.createdAt);
    const date2 = parseISO(post2.createdAt);
    return date2.getTime() - date1.getTime();
  });
};

export const getAllTreeNode = (): ContentFolder[] => {
  const folders = getTreeNode(postsDirectory);
  return folders;
};

const createIndex = (directory: string): Map<string, Post> => {
  const postMap = new Map<string, Post>();
  const stack: string[] = [directory];

  while (stack.length > 0) {
    const currentDirectory = stack.pop()!;
    const fileNames = fs.readdirSync(currentDirectory);

    for (const fileName of fileNames) {
      const filePath = join(currentDirectory, fileName);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        stack.push(filePath);
      } else if (fileName.endsWith(".md")) {
        const slug = getSlugFromFilePath(filePath);
        const post = getPostBySlug(slug);
        postMap.set(slug, post);
      }
    }
  }

  return postMap;
};

const getPostsFromIndex = (postMap: Map<string, Post>): Post[] => {
  return Array.from(postMap.values());
};

const getTreeNode = (
  directory: string,
  parentId: string = ""
): ContentFolder[] => {
  const fileNames = fs.readdirSync(directory);
  const folderList: ContentFolder[] = [];

  fileNames.forEach((fileName, index) => {
    const filePath = join(directory, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const id = `${parentId}${index + 1}`;
      const children = getTreeNode(filePath, id);
      folderList.push({
        id,
        path: fileName,
        name: capitalize(fileName),
        children,
      });
    } else if (fileName.endsWith(".md")) {
      const id = `${parentId}${index + 1}`;
      const slug = getSlugFromFilePath(filePath);
      const post = getPostBySlug(slug);
      folderList.push({
        id,
        path: post.slug,
        name: post.title,
        children: [],
      });
    }
  });

  return folderList;
};

const getSlugFromFilePath = (filePath: string): string => {
  return filePath
    .replace(postsDirectory, "")
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
};

export const getPostBySlug = (slug: string): Post => {
  const fullPath = join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stat = fs.statSync(fullPath);

  return {
    ...data,
    slug,
    content,
    tags: data.tags ?? [],
    category: data.category ?? [],
    createdAt: formatISO(stat.birthtime),
    updatedAt: formatISO(stat.mtime),
  } as Post;
};
