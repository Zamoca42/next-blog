import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { type Post } from "@/interface/post";
import { fetchGraphQL } from "@/app/api/action";
import { gql } from "graphql-request";
import Header from "@/app/_components/header";

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
    <main>
      <Container>
        <article className="my-28">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage ?? "/asset/blog/preview/cover.jpg"}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: {
    slug: string[];
  };
};

export function generateMetadata({ params }: Params): Metadata {
  const postSlug = params.slug.join("/");
  const post = getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Next.js Blog Example with ${CMS_NAME}`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
