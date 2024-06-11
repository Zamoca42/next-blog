import Link from "next/link";
import CoverImage from "@/component/ui/cover-image";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";
import { MarkdownBody, previewPlugins } from "@/component/post/markdown-body";
import { Post } from "@/interface/post";

type Props = {
  date: string;
} & Post;

export function HeroPost({
  title,
  date,
  description,
  slug,
  tags,
  star,
  excerpt,
}: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage
          title={title}
          src={"/asset/blog/dynamic-routing/cover.jpg"}
          slug={slug}
        />
      </div>
      <div className="md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight font-semibold">
            <Link href={`/post/${slug}`} className="nav-underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 ml-1 flex gap-2 items-center text-muted-foreground">
            <DateBox dateString={date} />
            <Tag tags={tags} />
            {star && <Star className="w-4 h-4" />}
          </div>
        </div>
        <div className="mb-4">
          {description || (
            <MarkdownBody content={excerpt} remarkPlugins={previewPlugins} />
          )}
        </div>
      </div>
    </section>
  );
}
