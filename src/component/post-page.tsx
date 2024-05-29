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
      className={`transition-margin duration-200 ease-in-out ${
        isOpen ? "md:pl-[21rem]" : "pl-2"
      } lg:pl-[20rem]`}
    >
      <div className="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16 pr-2">
        <article className="my-28">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage ?? "/asset/blog/preview/cover.jpg"}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </div>
    </div>
  );
};
