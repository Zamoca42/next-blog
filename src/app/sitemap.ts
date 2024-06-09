import { MetadataRoute } from "next";
import { getAllPosts } from "@/app/api/action";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...postUrls];
}
