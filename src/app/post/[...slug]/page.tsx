import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { type Post } from "@/interface/post";
import { fetchGraphQL } from "@/app/api/action";
import { gql } from "graphql-request";
import { SideBar } from "@/component/side-bar";
import { PostPage } from "@/component/post-page";
import markdownToHtml from "@/lib/markdown-to-html";

export default async function Post({ params }: Params) {
  const postSlug = params.slug.join("/");
  const getPostBySlug = await fetchGraphQL<{ post: Post }>(gql`
  query{
    post(slug: "${postSlug}") {
        title
        content
        date
        preview
        coverImage
        author {
          name
          picture
        }
        ogImage {
          url
        }
      }
    }
  `);
  const post = getPostBySlug.post;

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <div>
      <SideBar />
      <PostPage post={post} content={content} />
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

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
};

export const generateStaticParams = () => {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));
};
