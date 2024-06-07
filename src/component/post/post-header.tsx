import { PostTitle } from "@/component/post/post-title";
import User from "@/component/ui/user";
import { blogConfig } from "@/blog.config";
import DateBox from "@/component/ui/date-box";

type Props = {
  title: string;
  date: string;
};

export function PostHeader({ title, date }: Props) {
  const author = blogConfig.blog.author;
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="pb-2 mb-8 flex gap-2 justify-center md:justify-start border-b-[1px]">
        <User {...author} />
        <DateBox dateString={date} />
      </div>
    </>
  );
}
