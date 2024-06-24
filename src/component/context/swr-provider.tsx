"use client";

import { getAllPosts } from "@/app/api/action";
import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import useSWR, { SWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const usePostList = (): {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { data, error, isLoading } = useSWR<Post[]>("/api/post");

  return {
    posts: data || [],
    isLoading,
    isError: error,
  };
};

export const useTreeNode = (): {
  folders: ContentFolder[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { data, error, isLoading } = useSWR<ContentFolder[]>("/api/tree-node");

  return {
    folders: data || [],
    isLoading,
    isError: error,
  };
};

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
