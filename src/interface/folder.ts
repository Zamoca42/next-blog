import { Post } from "@/interface/post";

export type Folder = {
  name: string;
  path: string;
  posts: Post[];
};
