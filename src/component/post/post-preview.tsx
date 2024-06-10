import Link from "next/link";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";
import { MarkdownBody, previewPlugins } from "@/component/post/markdown-body";
import { Post } from "@/interface/post";

type Props = {
  date: string;
} & Post;

export function PostPreview({
  title,
  date,
  description,
  slug,
  tags,
  star,
  excerpt,
}: Props) {
  return (
    <div>
      <div className="mb-5">
        {/* <CoverImage slug={slug} title={title} src={coverImage} /> */}
      </div>
      <h3 className="text-3xl leading-snug">
        <Link href={`/post/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="py-6">
        {description || (
          <MarkdownBody content={excerpt} remarkPlugins={previewPlugins} />
        )}
      </div>
      <div className="flex gap-2 mb-4 items-center">
        <DateBox dateString={date} />
        <Tag tags={tags} />
        {star && <Star className="w-4 h-4" />}
      </div>
    </div>
  );
}
