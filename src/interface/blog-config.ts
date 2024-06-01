import { Author } from "@/interface/author";

export interface BlogConfig {
  navLink: {
    name: string;
    path: string;
  }[];
  blog?: {
    author: Author;
    media: {
      gitHub: string;
      email: string;
      gmail: string;
      linkedin: string;
    };
  };
  comment?: {
    provider: string;
    serverUrl: string;
  };
  name: string;
}
