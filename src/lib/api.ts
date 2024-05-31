import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { capitalize } from "./util";

const postsDirectory = join(process.cwd(), "content");

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

  return {
    ...data,
    slug,
    content,
  } as Post;
};

const getOnlyPosts = (directory: string, folders: string[] = []): Post[] => {
  const fileNames = fs.readdirSync(directory);
  const postList: Post[] = [];

  fileNames.forEach((fileName) => {
    const filePath = join(directory, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const subFolders = [...folders, fileName];
      const subPosts = getOnlyPosts(filePath, subFolders);
      postList.push(...subPosts);
    } else if (fileName.endsWith(".md")) {
      const slug = getSlugFromFilePath(filePath);
      const post = getPostBySlug(slug);
      postList.push(post);
    }
  });

  return postList;
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

export const getAllPosts = (): Post[] => {
  const posts = getOnlyPosts(postsDirectory);
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
};

export const getAllTreeNode = (): ContentFolder[] => {
  const folders = getTreeNode(postsDirectory);
  return folders;
};
