import { PostResponse } from "@/interfaces/graphql-res";
import { Post } from "@/interfaces/post";
import fs from "fs";
import request from "graphql-request";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "content");

// export function getPostSlugs() {
//   return fs.readdirSync(postsDirectory);
// }

export function getPostSlugs(): string[] {
  const fileNames = getPostFilePaths(postsDirectory);
  return fileNames.map((fileName) => {
    const slug = fileName
      .replace(postsDirectory, "")
      .replace(/\\/g, "/")
      .replace(/\.md$/, "");
    return slug;
  });
}

function getPostFilePaths(directory: string): string[] {
  const fileNames = fs.readdirSync(directory);
  const filePaths: string[] = [];

  fileNames.forEach((fileName) => {
    const filePath = join(directory, fileName);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const subFilePaths = getPostFilePaths(filePath);
      filePaths.push(...subFilePaths);
    } else if (fileName.endsWith(".md")) {
      filePaths.push(filePath);
    }
  });

  return filePaths;
}

export function getPostBySlug(slug: string) {
  // const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export const getGqlPost = async (
  query: string
): Promise<PostResponse<Post>> => {
  const res: PostResponse<Post> = await request(
    "http://localhost:3000/api/graphql",
    query
  );
  if (res.errors) {
    throw new Error(res.errors[0].message);
  }
  return res;
};
