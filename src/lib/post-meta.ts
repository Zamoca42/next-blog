import { Metadata } from "next";
import { blogConfig } from "@/blog.config";
import { delay } from "@/lib/util";
import { PostSlugParams, Post } from "@/interface/post";
import { getAllPosts, getPostBySlug } from "@/app/api/action";

export const generateStaticParams = async () => {
  const posts = await getAllPosts();

  await delay(2000);

  const result = posts.map((post: Post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));

  return result;
};

export const generateMetadata = async ({
  params,
}: PostSlugParams): Promise<Metadata> => {
  const postSlug = params.slug.join("/");
  const post = await getPostBySlug(postSlug);

  const { blog, host, name: applicationName } = blogConfig;

  const title = `${post.title} | Next.js Blog`;
  const keywords =
    post.tags.length === 0 ? ["Next.js", "blog", "react"] : post.tags;
  const description = post.description || post.excerpt;

  return {
    metadataBase: new URL(host),
    title,
    description,
    authors: blog.author,
    keywords,
    applicationName,
    generator: "Next.js",
    openGraph: {
      title,
      description,
      url: `${host}/post${postSlug}`,
      siteName: applicationName,
      images: [
        {
          url: "/favicon/android-chrome-512x512.png",
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
      locale: "en-US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/favicon/android-chrome-512x512.png"],
    },
  };
};
