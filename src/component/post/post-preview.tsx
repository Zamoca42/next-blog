import { type Author } from "@/interface/author";
import Link from "next/link";
import Avatar from "../ui/avatar";
import CoverImage from "../ui/cover-image";
import DateFormatter from "../ui/date-formatter";

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
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{description}</p>
    </div>
  );
}
