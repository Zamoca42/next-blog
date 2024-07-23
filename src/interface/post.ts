import { ParsedPost } from "@/lib/meta-util";

export type Post = ParsedPost & {
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PostSlugParams = {
  params: {
    slug: string[];
  };
};
