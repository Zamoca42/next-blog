// @ts-check
const fs = require("fs/promises");
const path = require("path");
const matter = require("gray-matter");
const algoliasearch = require("algoliasearch").default;
const { nanoid } = require("nanoid");
const {
  ALGOLIA_INDEX_NAME,
  POST_CONTENT_FOLDER,
} = require("../lib/constant");

const postsDirectory = path.join(process.cwd(), POST_CONTENT_FOLDER);

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
 * @property {{lvl0: string, lvl1: string, lvl2: string, lvl3: string}} hierarchy
 * @property {string} type
 * @property {string | null} content
 */

/**
 * @param {string} filePath
 * @returns {Promise<PostSearchIndex>}
 */
const createPostRecord = async (filePath) => {
  const slug = getSlugFromFilePath(filePath);
  const fileContents = await fs.readFile(filePath, "utf8");
  const { data, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  /** @type {PostSearchIndex} */
  const record = {
    objectID: `${nanoid()}-https://zamoca.space/post${slug}`,
    url: `https://zamoca.space/post${slug}`,
    hierarchy: {
      lvl0: "Documentation", //TODO: blog.config navLink
      lvl1: data.title,
      lvl2: data.tags || [],
      lvl3: data.description || null,
    },
    type: 'lvl3',
    content: excerpt || null,
  };
  
  return record;
};

/**
 * @returns {Promise<PostSearchIndex[]>}
 */
const getAllPosts = async () => {
  const fileNames = await fs.readdir(postsDirectory, { recursive: true });
  const posts = [];

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = path.join(postsDirectory, fileName);
      const post = await createPostRecord(filePath);
      posts.push(post);
    }
  }

  return posts;
};

const updateAlgoliaIndex = async () => {
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

/**
 * @param {string} filePath
 * @returns {string}
 */
const getSlugFromFilePath = (filePath) => {
  return filePath
    .replace(postsDirectory, "")
    .replace(/\\/g, "/")
    .replace(/\.md$/, "");
};

module.exports = {
  updateAlgoliaIndex,
};