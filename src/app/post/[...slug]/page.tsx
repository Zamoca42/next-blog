import { notFound } from "next/navigation";
import { getPostBySlug } from "@/app/api/action";
import { PostSlugParams } from "@/interface/post";
import { SideBar } from "@/component/layout/side-bar";
import { PostPage } from "@/component/post/post-page";
import { PostToc } from "@/component/post/post-toc";
import { generateToc } from "@/lib/unified-plugin";
import { generateStaticParams, generateMetadata } from "@/lib/post-meta";

export default async function PostDetail({ params }: PostSlugParams) {
  const postSlug = params.slug.join("/");
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const toc = generateToc(post.content);

  return (
    <>
      <SideBar toc={toc} />
      <PostPage post={post} content={post.content} />
      <aside className="fixed z-20 top-16 bottom-0 right-[max(0px,calc(50%-45rem))] w-[17rem] py-10 overflow-y-auto hidden xl:block">
        <div className="px-2 py-10 ltr">
          <h2 className="font-semibold mb-2 text-secondary-foreground">
            On this page
          </h2>
          <PostToc toc={toc} />
        </div>
      </aside>
    </>
  );
}

export { generateStaticParams, generateMetadata };
