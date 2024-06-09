import Link from "next/link";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";

type Props = {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  star: boolean;
};

export function PostPreview({
  title,
  date,
  description,
  slug,
  tags,
  star,
}: Props) {
  return (
    <div>
      <div className="mb-5">
        {/* <CoverImage slug={slug} title={title} src={coverImage} /> */}
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/post/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <p className="text-lg leading-relaxed mb-4 text-balance">{description}</p>
      <div className="flex gap-2 mb-4 items-center">
        <DateBox dateString={date} />
        <Tag tags={tags} />
        {star && <Star className="w-4 h-4" />}
      </div>
    </div>
  );
}
