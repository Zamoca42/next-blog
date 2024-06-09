import Link from "next/link";
import CoverImage from "@/component/ui/cover-image";
import DateBox from "../layout/date-box";
import Tag from "../layout/tag";
import { Star } from "lucide-react";

type Props = {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags: string[];
  star: boolean;
};

export function HeroPost({
  title,
  date,
  description,
  slug,
  tags,
  star,
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
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
            <Link href={`/post/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 flex gap-2 items-center">
            <DateBox dateString={date} />
            <Tag tags={tags} />
            {star && <Star className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{description}</p>
        </div>
      </div>
    </section>
  );
}
