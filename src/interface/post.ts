import { ParsedPost } from "@/lib/file-meta";

export type Post = ParsedPost & {
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type PostSlugParams = {
  params: Promise<{ slug: string[] }>;
};
