//@ts-check
import { POST_CONTENT_FOLDER, POST_HSITORY_NAME } from "./constant.js";
import { join } from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { formatISO } from "date-fns";
import { promisify } from "util";
import { exec as execCallback, execSync } from "child_process";

export const postsDirectory = join(process.cwd(), POST_CONTENT_FOLDER);
export const gitInfoPath = join(process.cwd(), "public", POST_HSITORY_NAME);
const exec = promisify(execCallback);

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
export const getMarkdownFiles = async (directory) => {
  const allFiles = await fs.readdir(directory, { recursive: true });
  return allFiles.filter((file) => file.endsWith(".md"));
};

export const getAllMarkdownSlugs = async () => {
  const allMarkdownFiles = await getMarkdownFiles(postsDirectory);
  return allMarkdownFiles.map(file => getSlugFromFilePath(file));
};

/**
 * @param {string} filePath
 * @returns {string}
 */
export const getSlugFromFilePath = (filePath) => {
  return filePath
    .replace(postsDirectory, "")
    .replace(/\\/g, "/")
    .replace(/\.md$/, "")
    .replace(/^\//, '');
};

/**
 * @typedef {Object} ParsedPost
 * @property {string} slug
 * @property {string} content
 * @property {string} excerpt
 * @property {string} title
 * @property {string} description
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 * @property {string[]} tags
 * @property {boolean} star
 */

/**
 * @typedef {Object} GitDates
 * @property {string | null} gitCreatedAt
 * @property {string | null} gitUpdatedAt
 */

/**
 * @param {string} filePath
 * @returns {Promise<ParsedPost>}
 */
export const parsePostContent = async (filePath) => {
  const slug = getSlugFromFilePath(filePath);
  const fileContents = await fs.readFile(filePath, "utf8");

  const { data, content, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  const frontmatterDate = data.date ? formatISO(new Date(data.date)) : null;

  return {
    slug,
    content,
    excerpt: excerpt || "",
    title: String(data.title || ""),
    description: data.description || "",
    createdAt: frontmatterDate,
    updatedAt: frontmatterDate,
    tags: data.tag ?? [],
    star: Boolean(data.star),
  };
};

/**
 * @param {string} filePath
 * @returns {Promise<GitDates>}
 */
export const getGitDates = async (filePath) => {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;

  const [gitCreatedAt, gitUpdatedAt] = await Promise.all([
    gitLogFileDate(createdAtCommand),
    gitLogFileDate(updatedAtCommand),
  ]);

  return { gitCreatedAt, gitUpdatedAt };
};

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

export const getGitTrackedSlugs = () => {
  try {
    const output = execSync('git ls-files content', { encoding: 'utf-8' });
    return output.trim().split('\n')
      .map(file => getSlugFromFilePath(file.replace(/^content\//, '')));
  } catch (error) {
    console.error('Error getting git tracked files:', error);
    return [];
  }
};