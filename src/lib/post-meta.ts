import { Metadata } from "next";
import { blogConfig } from "@/blog.config";
import { PostSlugParams, Post } from "@/interface/post";
import { getAllPosts, getPostBySlug } from "@/app/api/action";
import { notFound } from "next/navigation";

export const generateStaticParams = async () => {
  const posts = await getAllPosts();

  return posts.map((post: Post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));
};

export const generateMetadata = async ({
  params,
}: PostSlugParams): Promise<Metadata> => {
  if (!params.slug || params.slug.length === 0) {
    notFound();
  }

  const postSlug = params.slug?.join("/");
  const post = await getPostBySlug(postSlug);

  if (!post) {
    notFound();
  }

  const { blog, host, name: applicationName } = blogConfig;

  const title = post.title;
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
      url: `${host}/post/${postSlug}`,
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
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: false,
        noimageindex: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
};
