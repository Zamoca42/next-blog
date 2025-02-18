"use client";

import { SideBar } from "@/component/layout/sidebar";
import { MarkdownBody } from "@/component/post/markdown-body";
import { PostHeader } from "@/component/post/post-header";
import { PostToc } from "@/component/post/post-toc";
import DateFormatter from "@/component/ui/date-formatter";
import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import dynamic from "next/dynamic";
import { TocItem } from "remark-flexible-toc";

const DynamicGiscus = dynamic(() => import("@/component/post/giscus"), {
  ssr: false,
});

interface PostContentProps {
  post: Post;
  toc: TocItem[];
  folders: ContentFolder[];
}

export function PostContent({ post, toc, folders }: PostContentProps) {
  return (
    <>
      <SideBar toc={toc} folders={folders} slug={post.slug} />
      <div className="transition-margin duration-200 ease-in-out lg:pl-[19rem] md:pl-4">
        <div className="max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] md:pr-4">
          <article className="my-10 px-1">
            <PostHeader
              title={post.title}
              date={post.createdAt}
              tags={post.tags}
              star={post.star}
            />
            <div className="mb-12 max-w-3xl">
              <MarkdownBody content={post.content} />
            </div>
            <div className="max-w-3xl flex justify-end gap-2 text-base pb-4 border-b">
              <span className="text-secondary-foreground">Last update: </span>
              <DateFormatter
                className="text-muted-foreground"
                dateString={post.updatedAt}
              />
            </div>
            <DynamicGiscus />
          </article>
        </div>
      </div>
      {toc.length !== 0 && (
        <aside className="fixed z-20 top-16 bottom-0 right-[max(0px,calc(50%-45rem))] w-[17rem] py-10 overflow-y-auto hidden xl:block">
          <div className="px-2 py-10 ltr">
            <h2 className="font-semibold mb-2 text-secondary-foreground">
              On this page
            </h2>
            <PostToc toc={toc} />
          </div>
        </aside>
      )}
    </>
  );
}
