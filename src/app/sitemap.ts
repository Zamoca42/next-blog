import { MetadataRoute } from "next";
import { getAllPosts } from "@/app/api/action";
import { blogConfig } from "@/blog.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const { host } = blogConfig;

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${host}/post${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: host,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...postUrls,
  ];
}
