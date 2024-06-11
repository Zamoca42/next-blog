import { MetadataRoute } from "next";
import { getAllPosts } from "@/app/api/action";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `https://www.zamoca.space/posts${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [{ url: "/", lastModified: new Date() }, ...postUrls];
}
