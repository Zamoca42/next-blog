import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { type Post } from "@/interface/post";
import { gql } from "graphql-request";
import { SideBar } from "@/component/side-bar";
import { PostPage } from "@/component/post-page";
import { delay } from "@/lib/util";
import { blogConfig } from "@/blog.config";
import { graphQlClient, parseQuery } from "@/lib/graphql-request";

export default async function Post({ params }: Params) {
  const postSlug = params.slug.join("/");
  const query = parseQuery<{ post: Post }>(gql`
  query{
    post(slug: "${postSlug}") {
        title
        content
        description

      }
    }
  `);
  const getPostBySlug = await graphQlClient.request<{ post: Post }>({
    document: query,
  });
  const post = getPostBySlug.post;

  if (!post) {
    return notFound();
  }

  return (
    <div>
      <SideBar />
      <PostPage post={post} content={post.content} />
    </div>
  );
}

type Params = {
  params: {
    slug: string[];
  };
};

export const generateMetadata = ({ params }: Params): Metadata => {
  const postSlug = params.slug.join("/");
  const post = getPostBySlug(postSlug);

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
  const posts = getAllPosts();
  await delay(2000);
  return posts.map((post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));
};
