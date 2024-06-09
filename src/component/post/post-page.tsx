"use client";

import { PostBody } from "@/component/post/post-body";
import { PostHeader } from "@/component/post/post-header";
import { useSideBar } from "@/component/sidebar-provider";
import { Post } from "@/interface/post";
import DateFormatter from "../ui/date-formatter";

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
        isOpen ? "md:pl-[19rem]" : "pl-2"
      } lg:pl-[19rem]`}
    >
      <div className="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] pr-4">
        <article className="my-10 px-2">
          <PostHeader
            title={post.title}
            date={post.createdAt}
            tags={post.tags}
            star={post.star}
          />
          <PostBody content={content} />
          <div className="max-w-3xl flex justify-end gap-2 text-base pb-4 border-b">
            <span className="text-muted-foreground">Last update: </span>
            <DateFormatter dateString={post.updatedAt} />
          </div>
        </article>
      </div>
    </div>
  );
};
