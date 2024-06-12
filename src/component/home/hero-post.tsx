"use client";

import Link from "next/link";
import CoverImage from "@/component/ui/cover-image";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";
import { MarkdownBody, previewPlugins } from "@/component/post/markdown-body";
import { usePostList } from "@/component/post-provider";
import { useEffect, useState } from "react";
import { Post } from "@/interface/post";

export function HeroPost() {
  const { allPosts } = usePostList();
  const [post, setPost] = useState<Post>();

  useEffect(() => {
    setPost(allPosts[0]);
  }, [allPosts]);

  if (!post) return null;

  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage
          title={post.title}
          src={"/asset/blog/dynamic-routing/cover.jpg"}
          slug={post.slug}
        />
      </div>
      <div className="md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight font-semibold">
            <Link href={`/post/${post.slug}`} className="nav-underline">
              {post.title}
            </Link>
          </h3>
          <div className="mb-4 ml-1 flex gap-2 items-center text-muted-foreground">
            <DateBox dateString={post.createdAt} />
            <Tag tags={post.tags} />
            {post.star && <Star className="w-4 h-4" />}
          </div>
        </div>
        <div className="mb-4">
          {post.description || (
            <MarkdownBody content={post.excerpt} remarkPlugins={previewPlugins} />
          )}
        </div>
      </div>
    </section>
  );
}
