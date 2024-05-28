"use client";

import Container from "@/app/_components/container";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { useSideBar } from "@/component/provider";
import { Post } from "@/interface/post";

export const PostPage = ({
  post,
  content,
}: {
  post: Post;
  content: string;
}) => {
  const { isOpen } = useSideBar();

  return (
    <div
      className={`flex-1 transition-margin duration-200 ease-in-out ${
        isOpen ? "md:pl-80" : "pl-0 lg:pl-80"
      }`}
    >
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
    </div>
  );
};
