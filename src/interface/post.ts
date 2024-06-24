export type Post = {
  slug: string;
  title: string;
  description: string;
  order: number;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  star: boolean;
};

export type PostSlugParams = {
  params: {
    slug: string[];
  };
};
