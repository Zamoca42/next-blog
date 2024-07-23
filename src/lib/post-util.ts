import { Post } from "@/interface/post";
import { formatISO, parseISO } from "date-fns";
import { join } from "path";
import {
  ParsedPost,
  getMarkdownFiles,
  parsePostContent as parsePostContentJS,
  postsDirectory,
} from "@/lib/meta-util";
import gitInfo from "../../public/post-index.json";
import { PostHistory } from "@/interface/post-history";

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const markdownFiles = await getMarkdownFiles(postsDirectory);
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
    const post = await parsePostContent(`${slug}.md`);
    return applyPostHistory(post, gitInfo);
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
};

// export const parsePostContent = async (filePath: string): Promise<Post> => {
//   const fullPath = join(postsDirectory, filePath);
//   const slug = getSlugFromFilePath(filePath);
//   const fileContents = await fs.readFile(fullPath, "utf8");

//   const { data, content, excerpt } = matter(fileContents, {
//     excerpt: true,
//     excerpt_separator: "<!-- end -->",
//   });

//   return {
//     slug,
//     content,
//     excerpt: excerpt || "",
//     title: String(data.title),
//     description: data.description,
//     createdAt: data.date,
//     updatedAt: data.date,
//     tags: data.tag ?? [],
//     star: Boolean(data.star),
//   };
// };

// parsePostContentJS의 반환 타입을 Post로 변환하는 함수
const parsePostContent = async (filePath: string): Promise<ParsedPost> => {
  const fullPath = join(postsDirectory, filePath);
  return parsePostContentJS(fullPath);
};

const applyPostHistory = (
  post: ParsedPost,
  gitInfo: Record<string, PostHistory>
): Post => {
  const postHistory = gitInfo[post.slug];
  const fallbackDate = formatISO(new Date());
  return {
    ...post,
    createdAt: post.createdAt || postHistory?.createdAt || fallbackDate,
    updatedAt: post.updatedAt || postHistory?.updatedAt || fallbackDate,
  };
};
