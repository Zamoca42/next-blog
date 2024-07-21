//@ts-check
import { POST_CONTENT_FOLDER, POST_HSITORY_NAME } from "./constant.js";
import { join } from "path";
import fs from "fs/promises";

export const postsDirectory = join(process.cwd(), POST_CONTENT_FOLDER);
export const gitInfoPath = join(process.cwd(), "public", POST_HSITORY_NAME);

/**
 * @typedef {Object} PostHistory
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */

/**
 * @returns {Promise<Record<string, PostHistory>>}
 */
export const readGitInfo = async () => {
  try {
    const gitInfoData = await fs.readFile(gitInfoPath, "utf8");
    return JSON.parse(gitInfoData);
  } catch (error) {
    console.error("Error reading git info:", error);
    return {};
  }
};

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
export const getMarkdownFiles = async (directory) => {
  const allFiles = await fs.readdir(directory, { recursive: true });
  return allFiles.filter((file) => file.endsWith(".md"));
};

/**
 * @param {string} filePath
 * @returns {string}
 */
export const getSlugFromFilePath = (filePath) => {
  return filePath
    .replace(postsDirectory, "")
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
};
