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
    { name: "Database", path: "db" },
    { name: "Infra", path: "infra" },
    { name: "Javascript", path: "js-ts" },
    { name: "etc.", path: "etc" },
  ],
  author: {
    name: "추연규(Zamoca)",
    url: "https://github.com/zamoca42",
    email: "suntail2002@naver.com",
  },
  media: {
    github: "https://github.com/zamoca42",
    linkedin: "https://www.linkedin.com/in/연규-추-951017276",
  },
};
