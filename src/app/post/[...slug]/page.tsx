import { notFound } from "next/navigation";
import { getPostBySlug, getSpecificTreeNode } from "@/app/api/action";
import { PostSlugParams } from "@/interface/post";
import { SideBar } from "@/component/layout/sidebar";
import { PostToc } from "@/component/post/post-toc";
import { generateToc } from "@/lib/unified-plugin";
import { generateStaticParams, generateMetadata } from "@/lib/post-meta";
import { MarkdownBody } from "@/component/post/markdown-body";
import { PostHeader } from "@/component/post/post-header";
import DateFormatter from "@/component/ui/date-formatter";
import dynamic from "next/dynamic";

const DynamicGiscus = dynamic(() => import("@/component/post/giscus"), {
  ssr: false,
});

export default async function PostDetail({ params }: PostSlugParams) {
  const postSlug = params.slug.join("/");
  const postBranch = params.slug[0];
  const [post, folders] = await Promise.all([
    getPostBySlug(postSlug),
    getSpecificTreeNode(postBranch),
  ]);

  if (!post) {
    return notFound();
  }

  const toc = generateToc(post.content);

  return (
    <>
      <SideBar toc={toc} folders={folders} />
      <div
        className={`transition-margin duration-200 ease-in-out lg:pl-[19rem] md:pl-4`}
      >
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

export { generateStaticParams, generateMetadata };
