export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  description: string;
  order?: number;
  star: boolean;
};

export type PostSlugParams = {
  params: {
    slug: string[];
  };
};
