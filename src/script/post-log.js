// @ts-check

import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { exec as execCallback, execSync } from "child_process";
import { formatISO, differenceInDays } from "date-fns";
import { getMarkdownFiles, getSlugFromFilePath, gitInfoPath, postsDirectory } from "../lib/file-util.js";
import { POST_HSITORY_NAME } from "../lib/constant.js";
import matter from "gray-matter";

const exec = promisify(execCallback);

/**
 * @typedef {Object} GitDates
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */

/**
 * @param {string} command
 * @returns {Promise<string | null>}
 */
const gitLogFileDate = async (command) => {
  try {
    const { stdout } = await exec(command);
    const outputDate = stdout.trim();
    return outputDate ? formatISO(new Date(outputDate)) : null;
  } catch (error) {
    console.error(`Error executing git command: ${command}`, error);
    return null;
  }
};

/**
 * @param {string} filePath
 * @returns {Promise<GitDates>}
 */
const getGitDates = async (filePath) => {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;

  const [createdAt, updatedAt] = await Promise.all([
    gitLogFileDate(createdAtCommand),
    gitLogFileDate(updatedAtCommand),
  ]);

  return { createdAt, updatedAt };
};

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
 * @returns {Promise<[string, GitDates] | null>}
 */
const processFile = async (filePath) => {
  const { createdAt: gitCreatedAt, updatedAt } = await getGitDates(filePath);

  const fileContents = await fs.readFile(filePath, "utf8");
  const { data } = matter(fileContents);

  const frontmatterDate = data.date ? formatISO(new Date(data.date)) : null;

  const createdAt = frontmatterDate || gitCreatedAt;

  const slug = getSlugFromFilePath(filePath).replace(/^\//, '');
  return [slug, { createdAt, updatedAt }];
};

export const saveGitInfo = async () => {
  if (!(await shouldUpdateGitInfo(gitInfoPath))) {
    return;
  }

  const fileNames = await fs.readdir(postsDirectory, { recursive: true });

  /** @type {Record<string, GitDates>} */
  const gitInfo = {};

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = path.join(postsDirectory, fileName);
      const result = await processFile(filePath);
      if (result !== null) {
        const [slug, dates] = result;
        gitInfo[slug] = dates;
      }
    }
  }

  await fs.writeFile(gitInfoPath, JSON.stringify(gitInfo, null, 2));
  console.log(`Git information saved to ${POST_HSITORY_NAME}\n`);

  await validatePostHistory(gitInfo);
};

const getGitTrackedSlugs = () => {
  try {
    const output = execSync('git ls-files content', { encoding: 'utf-8' });
    return output.trim().split('\n')
      .map(file => getSlugFromFilePath(file.replace(/^content\//, '')));
  } catch (error) {
    console.error('Error getting git tracked files:', error);
    return [];
  }
};

const getAllMarkdownSlugs = async () => {
  const allMarkdownFiles = await getMarkdownFiles(postsDirectory);
  return allMarkdownFiles.map(file => getSlugFromFilePath(file));
};

/**
 * @param {Record<string, GitDates>} gitInfo
 */
const validatePostHistory = async (gitInfo) => {
  const allMarkdownSlugs = await getAllMarkdownSlugs();
  const gitTrackedSlugs = getGitTrackedSlugs();
  const historySlugs = Object.keys(gitInfo);

  console.log(`Total markdown files: ${allMarkdownSlugs.length}`);
  console.log(`Git tracked markdown files: ${gitTrackedSlugs.length}`);
  console.log(`Slugs in post-history.json: ${historySlugs.length} \n`);

  const missingFromHistory = gitTrackedSlugs.filter(slug => !historySlugs.includes(slug));
  const extraInHistory = historySlugs.filter(slug => !gitTrackedSlugs.includes(slug));
  const untrackedSlugs = allMarkdownSlugs.filter(slug => !gitTrackedSlugs.includes(slug));

  if (missingFromHistory.length > 0) {
    console.warn('Slugs missing from post-history.json:', missingFromHistory);
  }

  if (extraInHistory.length > 0) {
    console.warn('Extra slugs in post-history.json:', extraInHistory);
  }

  if (untrackedSlugs.length > 0) {
    console.warn('Untracked markdown files (slugs):', untrackedSlugs);
  }
};