interface BlogConfigProps {
  postLink: {
    name: string;
    path: string;
  }[];
}

export const blogConfig: BlogConfigProps = {
  postLink: [
    { name: "Test", path: "test" },
    { name: "News", path: "news" },
  ],
};
