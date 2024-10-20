import { CMS_NAME } from "./lib/constant.js";

/**
 * @typedef {Object} Author
 * @property {string} name
 * @property {string} url
 * @property {string} email
 */

/**
 * @typedef {Object} BlogConfig
 * @property {string} name
 * @property {string} host
 * @property {string} description
 * @property {Array<{name: string, path: string}>} nav
 * @property {Author} author
 * @property {Object} media
 * @property {string} media.github
 * @property {string} media.linkedin
 */

/** @type {BlogConfig} */
export const blogConfig = {
  name: "Zamoca Space",
  host: "https://zamoca.space",
  description: `A statically generated blog using Next.js and ${CMS_NAME}.`,
  nav: [
    { name: "Review", path: "retrospect" },
    { name: "Javascript", path: "js-ts" },
    { name: "etc.", path: "etc" },
  ],
  author: {
    name: "추연규(Zamoca)",
    url: "https://choo.ooo/git",
    email: "yk@choo.ooo",
  },
  media: {
    github: "https://choo.ooo/git",
    linkedin: "https://choo.ooo/linkedin",
  },
};
