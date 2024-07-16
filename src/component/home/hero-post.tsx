import Link from "next/link";
import CoverImage from "@/component/ui/cover-image";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";
import { MarkdownBody, previewPlugins } from "@/component/post/markdown-body";
import { Post } from "@/interface/post";
import { CardDescription } from "@/component/ui/card";

type Params = {
  post: Post;
};

export function HeroPost({ post }: Params) {
  if (!post) return null;

  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage
          title={post.title}
          src={"/asset/blog/dynamic-routing/cover.webp"}
          slug={post.slug}
        />
      </div>
      <div className="md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div className="space-y-2">
          <h3 className="text-2xl lg:text-5xl leading-none font-semibold truncate pb-2">
            <Link href={`/post/${post.slug}`} className="nav-underline">
              {post.title}
            </Link>
          </h3>
          <CardDescription>{post.description}</CardDescription>
          <div className="mb-4 ml-1 flex gap-2 items-center text-muted-foreground">
            <DateBox dateString={post.createdAt} />
            <Tag tags={post.tags} />
            {post.star && <Star className="w-4 h-4" />}
          </div>
        </div>
        <div className="mb-4">
          <MarkdownBody content={post.excerpt} remarkPlugins={previewPlugins} />
        </div>
      </div>
    </section>
  );
}
