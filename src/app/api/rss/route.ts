import { Feed } from "feed";
import { blogConfig } from "@/blog-config";
import { getAllPosts } from "@/lib/post-util";
import { NextResponse } from "next/server";

const master = {
  name: blogConfig.author.name,
  email: blogConfig.author.email,
  link: blogConfig.host,
};

const feed = new Feed({
  title: blogConfig.name,
  description: blogConfig.description,
  id: blogConfig.host,
  link: blogConfig.host,
  language: "ko",
  image: `${blogConfig.host}/android-chrome-512x512.png`,
  favicon: `${blogConfig.host}/favicon.ico`,
  copyright: `All rights reserved since 2024, ${master.name}`,
  generator: "generate-rss",
  feedLinks: {
    json: `${blogConfig.host}/api/rss?format=json`,
    atom: `${blogConfig.host}/api/rss?format=atom`,
  },
  author: master,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const allPosts = await getAllPosts();

  allPosts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.slug,
      link: `${blogConfig.host}/${post.slug}`,
      description: post.description,
      content: post.excerpt,
      author: [master],
      contributor: [master],
      date: new Date(post.createdAt),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  let content: string;
  let contentType: string;

  switch (format) {
    case "atom":
      content = feed.atom1();
      contentType = "application/atom+xml; charset=utf-8";
      break;
    case "json":
      content = feed.json1();
      contentType = "application/json; charset=utf-8";
      break;
    default:
      content = feed.rss2();
      contentType = "application/rss+xml; charset=utf-8";
  }

  if (format !== "json") {
    content = '<?xml version="1.0" encoding="utf-8"?>\n' + content;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
    },
  });
}
