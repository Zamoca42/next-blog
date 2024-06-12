import { MetadataRoute } from "next";
import { getAllPosts } from "@/app/api/action";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = "https://www.zamoca.space";
  const posts = await getAllPosts();

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${host}/posts${post.slug}`,
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
