// @ts-check

import fs from "fs/promises";
import path from "path";
import { differenceInDays, formatISO } from "date-fns";
import { 
  getAllMarkdownSlugs, 
  getGitDates, 
  getGitTrackedSlugs, 
  postIndexPath, 
  parsePostContent, 
  postsDirectory 
} from "../lib/meta-util.js";
import { POST_HSITORY_NAME } from "../lib/constant.js";

/**
 * @typedef {Object} PostMetadata
 * @property {string} excerpt
 * @property {string} title
 * @property {string} description
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string[]} tags
 */

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
const shouldUpdateGitInfo = async (filePath) => {
  try {
    const fileStats = await fs.stat(filePath);
    const currentDate = new Date();
    const lastModifiedDate = new Date(fileStats.mtime);
    return differenceInDays(currentDate, lastModifiedDate) >= 3;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return true;
    }
    console.error("Error accessing Git information file:", error);
    return false;
  }
};

/**
 * @param {string} filePath
 * @returns {Promise<[string, PostMetadata] | null>}
 */
const processFile = async (filePath) => {
  const { content, slug, star, ...post } = await parsePostContent(filePath);
  const { gitCreatedAt, gitUpdatedAt} = await getGitDates(filePath)
  const fallbackDate = formatISO(new Date())
  return [slug, {
    ...post, 
    createdAt: post.createdAt || gitCreatedAt || fallbackDate, 
    updatedAt: post.updatedAt || gitUpdatedAt || fallbackDate,
  }];
};

export const savePostMetadata = async () => {
  if (!(await shouldUpdateGitInfo(postIndexPath))) {
    return;
  }

  const fileNames = await fs.readdir(postsDirectory, { recursive: true });

  /** @type {Record<string, PostMetadata>} */
  const postMeta = {};

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = path.join(postsDirectory, fileName);
      const result = await processFile(filePath);
      if (result !== null) {
        const [slug, post] = result;
        postMeta[slug] = post;
      }
    }
  }

  await fs.writeFile(postIndexPath, JSON.stringify(postMeta, null, 2));
  console.log(`Git information saved to ${POST_HSITORY_NAME}\n`);

  await validatePosts(postMeta);
};

/**
 * @param {Record<string, PostMetadata>} gitInfo
 */
const validatePosts = async (gitInfo) => {
  const allMarkdownSlugs = await getAllMarkdownSlugs();
  const gitTrackedSlugs = getGitTrackedSlugs();
  const historySlugs = Object.keys(gitInfo);

  console.log(`Total markdown files: ${allMarkdownSlugs.length}`);
  console.log(`Git tracked markdown files: ${gitTrackedSlugs.length}`);
  console.log(`Slugs in ${POST_HSITORY_NAME}: ${historySlugs.length} \n`);

  const missingFromHistory = gitTrackedSlugs.filter(slug => !historySlugs.includes(slug));
  const extraInHistory = historySlugs.filter(slug => !gitTrackedSlugs.includes(slug));
  const untrackedSlugs = allMarkdownSlugs.filter(slug => !gitTrackedSlugs.includes(slug));

  if (missingFromHistory.length > 0) {
    console.warn(`Slugs missing from ${POST_HSITORY_NAME}:`, missingFromHistory);
  }

  if (extraInHistory.length > 0) {
    console.warn(`Extra slugs in ${POST_HSITORY_NAME}:`, extraInHistory);
  }

  if (untrackedSlugs.length > 0) {
    console.warn(`Untracked markdown files (slugs):`, untrackedSlugs);
  }
};