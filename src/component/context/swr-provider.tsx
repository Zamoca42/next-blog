"use client";

import { ContentFolder } from "@/interface/folder";
import { Post } from "@/interface/post";
import useSWR, { SWRConfig } from "swr";
import { gql } from "graphql-request";

export const fetcherGql = (query: string) =>
  fetch(`/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  })
    .then((r) => r.json())
    .then((res) => res.data);

export const useBlogContent = (): {
  posts: Post[];
  folders: ContentFolder[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { data, error, isLoading } = useSWR<{
    posts: Post[];
    folders: ContentFolder[];
  }>(
    gql`
      fragment TreeNode on Folder {
        id
        name
        path
      }

      query {
        posts {
          slug
          createdAt
          updatedAt
          tags
          description
          star
          excerpt
        }

        folders {
          ...TreeNode
          children {
            ...TreeNode
            children {
              ...TreeNode
              children {
                ...TreeNode
              }
            }
          }
        }
      }
    `
  );

  return {
    posts: data?.posts!,
    folders: data?.folders!,
    isLoading,
    isError: error,
  };
};

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher: fetcherGql,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};
