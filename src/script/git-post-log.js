// @ts-check

import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { formatISO, differenceInDays } from "date-fns";
import { gitInfoPath, postsDirectory } from "../lib/file-util.js";
import { GIT_HSITORY_FILE_NAME } from "../lib/constant.js";

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
const updateGitInfo = async (filePath) => {
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
  const { createdAt, updatedAt } = await getGitDates(filePath);
  if (createdAt === null) return null;
  const relativePath = path.relative(process.cwd(), filePath);
  return [relativePath, { createdAt, updatedAt }];
};

export const saveGitInfo = async () => {
  if (!(await updateGitInfo(gitInfoPath))) {
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
        const [relativePath, dates] = result;
        gitInfo[relativePath] = dates;
      }
    }
  }

  await fs.writeFile(gitInfoPath, JSON.stringify(gitInfo, null, 2));
  console.log(`Git information saved to ${GIT_HSITORY_FILE_NAME}\n`);
};