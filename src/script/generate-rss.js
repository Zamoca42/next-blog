//@ts-check

import { Feed } from "feed";
import { writeFileSync, readFileSync } from "fs";

import { blogConfig } from "../blog-config.js";
import { gitInfoPath } from "../lib/meta-util.js";

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
  /** @type {Record<string, import("./post-index.js").PostMetadata>} */
  const postIndex = JSON.parse(readFileSync(gitInfoPath, "utf-8"));

  Object.entries(postIndex).forEach(([slug, post]) => {
    feed.addItem({
      title: post.title,
      id: slug,
      link: `${blogConfig.host}${slug}`,
      description: post.description,
      content: post.excerpt,
      author: [master],
      contributor: [master],
      date: new Date(post.createdAt),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  // Output: RSS 2.0
  writeFileSync("public/rss.xml", feed.rss2(), "utf-8");
  // Output: Atom 1.0
  writeFileSync("public/rss-atom.xml", feed.atom1(), "utf-8");
  // Output: JSON Feed 1.0
  writeFileSync("public/feed.json", feed.json1(), "utf-8");
}