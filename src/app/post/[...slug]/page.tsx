import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/app/api/action";
import { type Post } from "@/interface/post";
import { SideBar } from "@/component/layout/side-bar";
import { PostPage } from "@/component/post/post-page";
import { delay } from "@/lib/util";
import { blogConfig } from "@/blog.config";
import { generateToc } from "@/lib/md-toc";
import { MdTOC } from "@/component/post/post-toc";

export default async function Post({ params }: Params) {
  const postSlug = params.slug.join("/");
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const toc = await generateToc(post.content);

  return (
    <div>
      <SideBar />
      <PostPage post={post} content={post.content} />
      <MdTOC toc={toc}/>
    </div>
  );
}

type Params = {
  params: {
    slug: string[];
  };
};

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const postSlug = params.slug.join("/");
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Next.js Blog`;
  const keywords = !post.tags ? ["Next.js", "blog", "react"] : post.tags;
  const applicationName = blogConfig.name ?? "Blog";

  return {
    // metadataBase, //favicon
    title,
    description: post.description,
    authors: blogConfig.blog?.author,
    keywords,
    applicationName,
    generator: "Next.js",
  };
};

export const generateStaticParams = async () => {
  const posts = await getAllPosts();
  await delay(2000);
  return posts.map((post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));
};
