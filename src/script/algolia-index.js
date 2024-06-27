// @ts-check
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import algoliasearch from "algoliasearch";
import { ALGOLIA_INDEX_NAME } from "../lib/constant.js";
import { getMarkdownFiles, getSlugFromFilePath, postsDirectory } from "../lib/file-util.js";

const appId = process.env.NEXT_PUBLIC_DOCSEARCH_APP_ID;
const apiKey = process.env.ALGOLIA_ADMIN_KEY;

if (!appId || !apiKey) {
  throw new Error("Algolia appId or apiKey is missing");
}

const client = algoliasearch(appId, apiKey);

/**
 * @typedef {Object} PostSearchIndex
 * @property {string} objectID
 * @property {string} url
 * @property {{lvl0: string, lvl1: string, lvl2: string, lvl3: string[]}} hierarchy
 * @property {string} type
 * @property {string | null} content
 * @property {string[]} tags
 */

/**
 * @param {string} filePath
 * @param {number} index
 * @returns {Promise<PostSearchIndex>}
 */
const createPostRecord = async (filePath, index) => {
  const slug = getSlugFromFilePath(filePath);
  const fileContents = await fs.readFile(filePath, "utf8");
  const { data, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  return {
    objectID: `${index}-https://zamoca.space/post${slug}`,
    url: `https://zamoca.space/post${slug}`,
    hierarchy: {
      lvl0: "Documentation",
      lvl1: data.title,
      lvl2: data.description || null,
      lvl3: data.tag || []
    },
    type: 'lvl1',
    content: excerpt || null,
    tags: data.tag
  };
};

/**
 * @returns {Promise<PostSearchIndex[]>}
 */
const getAllPosts = async () => {
  const markdownFiles = await getMarkdownFiles(postsDirectory);
  return Promise.all(
    markdownFiles.map(async (fileName, index) => {
      const filePath = path.join(postsDirectory, fileName);
      return await createPostRecord(filePath, index);
    })
  );
}

export const updateAlgoliaIndex = async () => {
  try {
    const posts = await getAllPosts();
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    await index.replaceAllObjects(posts);
    console.log(
      `Algolia index updated successfully`
    );
  } catch (error) {
    console.error("Error updating Algolia index:");
    console.error(JSON.stringify(error, null, 2));
  }
};