"use client";

import { PostHeader } from "@/component/post/post-header";
import { useSideBar } from "@/component/sidebar-provider";
import { Post } from "@/interface/post";
import DateFormatter from "../ui/date-formatter";
import { MarkdownBody } from "@/component/post/markdown-body";
import Giscus from "@/component/post/giscus";

type Props = {
  post: Post;
  content: string;
};

export const PostPage = ({ post, content }: Props) => {
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
          <div className="mb-12 max-w-3xl">
            <MarkdownBody content={content} />
          </div>
          <div className="max-w-3xl flex justify-end gap-2 text-base pb-4 border-b">
            <span className="text-secondary-foreground">Last update: </span>
            <DateFormatter
              className="text-muted-foreground"
              dateString={post.updatedAt}
            />
          </div>
          <Giscus />
        </article>
      </div>
    </div>
  );
};
