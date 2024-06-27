import Link from "next/link";
import DateBox from "@/component/layout/date-box";
import Tag from "@/component/layout/tag";
import { Star } from "lucide-react";
import { MarkdownBody, previewPlugins } from "@/component/post/markdown-body";
import { Post } from "@/interface/post";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/component/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/post/${slug}`} className="nav-underline">
            {title}
          </Link>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {excerpt && (
          <MarkdownBody content={excerpt} remarkPlugins={previewPlugins} />
        )}
      </CardContent>
      <CardFooter className="flex space-x-2 items-center text-muted-foreground">
        <DateBox dateString={date} />
        <Tag tags={tags} />
        {star && <Star className="w-4 h-4" />}
      </CardFooter>
    </Card>
  );
}
