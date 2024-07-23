import { Author } from "@/interface/author";

export interface BlogConfig {
  name: string;
  description: string;
  host: string;
  nav: {
    name: string;
    path: string;
  }[];
  author: Author;
  media: {
    github: string;
    linkedin: string;
  };
}
