import { BlogConfig } from "@/interface/blog-config";

export const blogConfig: BlogConfig = {
  name: "Zamoca Space",
  navLink: [
    { name: "Database", path: "db" },
    { name: "Infra", path: "infra" },
    { name: "Javascript", path: "js-ts" },
    { name: "etc.", path: "etc" },
  ],
  blog: {
    author: {
      name: "추연규(Zamoca)",
      url: "https://github.com/zamoca42",
    },
    media: {
      gitHub: "https://github.com/zamoca42",
      email: "mailto:suntail2002@naver.com",
      gmail: "mailto:suntail93@gmail.com",
      linkedin: "https://www.linkedin.com/in/연규-추-951017276",
    },
  },
};
