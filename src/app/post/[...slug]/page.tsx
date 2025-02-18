import { notFound } from "next/navigation";
import { getPostBySlug, getSpecificTreeNode } from "@/app/api/action";
import { PostSlugParams } from "@/interface/post";
import { generateToc } from "@/lib/unified-plugin";
import {
  generateStaticParams,
  generateMetadata,
} from "@/lib/post-next-metadata";
import { PostContent } from "./page-content";

export default async function PostDetail({ params }: PostSlugParams) {
  const resolvedParams = await params;

  if (!resolvedParams.slug || resolvedParams.slug.length === 0) {
    notFound();
  }

  const postSlug = resolvedParams.slug.join("/");
  const postBranch = resolvedParams.slug[0];
  const [post, folders] = await Promise.all([
    getPostBySlug(postSlug),
    getSpecificTreeNode(postBranch),
  ]);

  if (!post) {
    return notFound();
  }

  const toc = generateToc(post.content);

  return <PostContent post={post} toc={toc} folders={folders} />;
}

export { generateStaticParams, generateMetadata };
