import Link from "next/link";
import DateBox from "@/component/ui/date-box";

type Props = {
  title: string;
  date: string;
  description: string;
  slug: string;
};

export function PostPreview({ title, date, description, slug }: Props) {
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
      <div className="flex gap-2 mb-4">
        <DateBox dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{description}</p>
    </div>
  );
}
