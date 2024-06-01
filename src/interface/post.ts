import { type Author } from "./author";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
};
