// @ts-check
import algoliasearch from "algoliasearch";
import { ALGOLIA_INDEX_NAME } from "../lib/constant.js";
import { gitInfoPath } from "../lib/meta-util.js";
import { readFileSync } from "fs";

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
 * @param {string} slug
 * @param {import("./post-index.js").PostMetadata} post
 * @param {number} index
 * @returns {PostSearchIndex}
 */
const createPostRecord = (slug, post, index) => {
  return {
    objectID: `${index}-https://zamoca.space${slug}`,
    url: `https://zamoca.space${slug}`,
    hierarchy: {
      lvl0: "Documentation",
      lvl1: post.title,
      lvl2: post.description,
      lvl3: post.tags || []
    },
    type: 'lvl1',
    content: post.excerpt || null,
    tags: post.tags
  };
};

export const updateAlgoliaIndex = async () => {
  try {
    /** @type {Record<string, import("./post-index.js").PostMetadata>} */
    const postIndex = JSON.parse(readFileSync(gitInfoPath, "utf-8"));

    const posts = Object.entries(postIndex).map(([slug, post], index) => 
      createPostRecord(slug, post, index)
    );

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