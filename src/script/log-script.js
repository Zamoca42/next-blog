// @ts-check

const fs = require("fs/promises");
const path = require("path");
const { exec } = require("child_process");
const { formatISO, differenceInDays } = require("date-fns");
const { GIT_HSITORY_FILE_NAME, POST_CONTENT_FOLDER } = require("../lib/constant");

const postsDirectory = path.join(process.cwd(), POST_CONTENT_FOLDER);
const gitInfoPath = path.join(process.cwd(), 'public', GIT_HSITORY_FILE_NAME);

/**
 * @typedef {Object} GitDates
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */

/**
 * @param {string} filePath
 * @returns {Promise<GitDates>}
 */
const getGitDates = async (filePath) => {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;

  /**
   * @param {string} command
   * @returns {Promise<string | null>}
   */
  const gitLogFileDate = async (command) => {
    const outputDate = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });

    if (!outputDate) {
      return null;
    }

    return formatISO(new Date(outputDate));
  };

  const [createdAt, updatedAt] = await Promise.all([
    gitLogFileDate(createdAtCommand),
    gitLogFileDate(updatedAtCommand),
  ]);
  
  return { createdAt, updatedAt };
}

/**
 * @typedef {Object} GitInfo
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */
const saveGitInfo = async () => {
  try {
    const fileStats = await fs.stat(gitInfoPath);
    const currentDate = new Date();
    const lastModifiedDate = new Date(fileStats.mtime);
    const daysDiff = differenceInDays(currentDate, lastModifiedDate);
    if (daysDiff < 7) {
      return;
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      console.error("Error accessing Git information file:", error);
      return;
    }
  }

  /** @type {Record<string, GitInfo>} */
  const gitInfo = {};
  const baseDirectory = process.cwd();
  const fileNames = await fs.readdir(postsDirectory, { recursive: true });

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = path.join(postsDirectory, fileName);
      const { createdAt, updatedAt } = await getGitDates(filePath);
      if (createdAt === null) continue;
      const relativePath = path.relative(baseDirectory, filePath);
      gitInfo[relativePath] = { createdAt, updatedAt };
    }
  }

  await fs.writeFile(gitInfoPath, JSON.stringify(gitInfo, null, 2));
  console.log(`Git information saved to ${GIT_HSITORY_FILE_NAME}`);
}

module.exports = {
  saveGitInfo,
  postsDirectory,
  gitInfoPath,
};