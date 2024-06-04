import Link from "next/link";
import DateFormatter from "../ui/date-formatter";
import CoverImage from "@/component/ui/cover-image";

type Props = {
  title: string;
  date: string;
  description: string;
  slug: string;
};

export function HeroPost({ title, date, description, slug }: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} src={"/asset/blog/dynamic-routing/cover.jpg"} slug={slug} />
      </div>
      <div className="md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
            <Link href={`/post/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{description}</p>
        </div>
      </div>
    </section>
  );
}