import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/app/api/action";
import { type Post } from "@/interface/post";
import { SideBar } from "@/component/layout/side-bar";
import { PostPage } from "@/component/post/post-page";
import { delay } from "@/lib/util";
import { blogConfig } from "@/blog.config";
import { PostToc } from "@/component/post/post-toc";
import { generateToc } from "@/lib/unified-plugin";

export default async function Post({ params }: Params) {
  const postSlug = params.slug.join("/");
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const toc = await generateToc(post.content);

  return (
    <>
      <SideBar toc={toc} />
      <PostPage post={post} content={post.content} />
      <aside className="fixed z-20 top-16 bottom-0 right-[max(0px,calc(50%-45rem))] w-[17rem] py-10 overflow-y-auto hidden xl:block">
        <div className="px-2 py-10 ltr">
          <h2 className="font-semibold mb-2 text-secondary-foreground">
            On this page
          </h2>
          <PostToc toc={toc} />
        </div>
      </aside>
    </>
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
    description: post.description || post.excerpt,
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
