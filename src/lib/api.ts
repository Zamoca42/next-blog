import { Folder } from "@/interface/folder";
import { Post } from "@/interface/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "content");

const getPostFilePaths = (
  directory: string,
  folders: string[] = []
): Post[] => {
  const fileNames = fs.readdirSync(directory);
  const filePaths: Post[] = [];

  fileNames.forEach((fileName) => {
    const filePath = join(directory, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const subFolders = [...folders, fileName];
      const subFilePaths = getPostFilePaths(filePath, subFolders);
      filePaths.push(...subFilePaths);
    } else if (fileName.endsWith(".md")) {
      const slug = filePath
        .replace(postsDirectory, "")
        .replace(/\\/g, "/")
        .replace(/\.md$/, "");
      const post = getPostBySlug(slug, folders);
      filePaths.push(post);
    }
  });

  return filePaths;
};

export const getPostSlugs = (): string[] => {
  const posts = getPostFilePaths(postsDirectory);
  return posts.map((post) => post.slug);
};

export const getPostBySlug = (slug: string, folders: string[] = []): Post => {
  const fullPath = join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...data,
    slug,
    content,
    folders,
  } as Post;
};

export const getAllPosts = (): Post[] => {
  const posts = getPostFilePaths(postsDirectory);
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
};

export const getTopLevelFolders = (): Omit<Folder, "posts">[] => {
  const folders: Omit<Folder, "posts">[] = [];
  const fileNames = fs.readdirSync(postsDirectory);

  fileNames.forEach((fileName) => {
    const filePath = join(postsDirectory, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      folders.push({
        name: fileName.toUpperCase(),
        path: fileName,
      });
    }
  });

  return folders;
};
