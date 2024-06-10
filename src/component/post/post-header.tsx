import { PostTitle } from "@/component/post/post-title";
import User from "@/component/layout/user";
import { blogConfig } from "@/blog.config";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";

type Props = {
  title: string;
  date: string;
  tags: string[];
  star: boolean;
};

export function PostHeader({ title, date, tags, star }: Props) {
  const author = blogConfig.blog.author;
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="max-w-3xl pb-2 mb-8 flex gap-2 justify-center items-center md:justify-start border-b  text-muted-foreground">
        <User {...author} />
        <DateBox dateString={date} />
        <Tag tags={tags} />
        {star && <Star className="w-4 h-4" />}
      </div>
    </>
  );
}
