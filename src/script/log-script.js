// @ts-check

const fs = require("fs/promises");
const path = require("path");
const { exec } = require("child_process");
const { formatISO } = require("date-fns");
const { GIT_HSITORY_FILE_NAME, POST_CONTENT_FOLDER } = require("../lib/constant");

const postsDirectory = path.join(process.cwd(), POST_CONTENT_FOLDER);
const gitInfoPath = path.join(process.cwd(), 'public', GIT_HSITORY_FILE_NAME);

/**
 * @typedef {Object} GitDates
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @param {string} filePath
 * @returns {Promise<GitDates>}
 */
async function getGitDates(filePath) {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;

  /**
   * @param {string} command
   * @returns {Promise<string>}
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
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @returns {Promise<void>}
 */
async function saveGitInfo() {
  try {
    await fs.access(gitInfoPath);
  } catch {
    console.log("Git information cannot access.");

    /** @type {Record<string, GitInfo>} */
    const gitInfo = {};
    const stack = [postsDirectory];
    const baseDirectory = process.cwd();

    while (stack.length > 0) {
      const currentDirectory = stack.pop();
      if (!currentDirectory) continue;
      const fileNames = await fs.readdir(currentDirectory);

      for (const fileName of fileNames) {
        const filePath = path.join(currentDirectory, fileName);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          stack.push(filePath);
        } else if (fileName.endsWith(".md")) {
          const { createdAt, updatedAt } = await getGitDates(filePath);
          const relativePath = path.relative(baseDirectory, filePath);
          gitInfo[relativePath] = { createdAt, updatedAt };
        }
      }
    }

    fs.writeFile(gitInfoPath, JSON.stringify(gitInfo, null, 2));
    console.log(`Git information saved to ${GIT_HSITORY_FILE_NAME}`);
  }
}

module.exports = {
  saveGitInfo,
  postsDirectory,
  gitInfoPath,
};