import { Post } from "@/interface/post";

export type ContentFolder = {
  id: string;
  name: string;
  path: string;
  order?: Post["order"];
  children: ContentFolder[];
};
