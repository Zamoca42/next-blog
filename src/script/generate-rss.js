//@ts-check

import { Feed } from "feed";
import fs from "fs/promises";

import { blogConfig } from "../blog-config.js";
import { postIndexPath } from "../lib/file-meta.js";

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
    json: `${blogConfig.host}/json`,
    atom: `${blogConfig.host}/atom`,
  },
  author: master,
});

export const generateRssFeed = async () => {
  const rssXmlPath = "public/rss.xml";
  const rssAtomPath = "public/rss-atom.xml";
  const feedJsonPath = "public/feed.json";
  
  /** @type {Record<string, import("./post-index.js").PostMetadata>} */
  const postIndex = JSON.parse(await fs.readFile(postIndexPath, "utf-8"));

  Object.entries(postIndex).forEach(([slug, post]) => {
    feed.addItem({
      title: post.title,
      id: slug,
      link: `${blogConfig.host}/${slug}`,
      description: post.description,
      content: post.excerpt,
      author: [master],
      contributor: [master],
      date: new Date(post.createdAt),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  await Promise.all([
    fs.writeFile(rssXmlPath, feed.rss2(), "utf-8"),
    fs.writeFile(rssAtomPath, feed.atom1(), "utf-8"),
    fs.writeFile(feedJsonPath, feed.json1(), "utf-8")
  ]);

  console.log("RSS feeds generated successfully\n");
}