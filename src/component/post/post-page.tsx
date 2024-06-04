"use client";

import { PostBody } from "@/component/post/post-body";
import { PostHeader } from "@/component/post/post-header";
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
        isOpen ? "md:pl-[22rem]" : "pl-2"
      } lg:pl-[22rem]`}
    >
      <div className="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] pr-4">
        <article className="my-10 px-2 md:ml-8">
          <PostHeader title={post.title} date={post.createdAt} />
          <PostBody content={content} />
        </article>
      </div>
    </div>
  );
};
