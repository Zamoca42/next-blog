export type Post = {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
};
