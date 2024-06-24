"use client";

import { Post } from "@/interface/post";
import { graphQlClient } from "@/lib/graphql-request";
import { gql } from "graphql-request";
import useSWR, { SWRConfig } from "swr";

const fetcher = (query: string) => graphQlClient.request({ document: query });

export const usePostList = (): {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
} => {
  const { data, error, isLoading } = useSWR<{ posts: Post[] }>(gql`
    query Posts {
      posts {
        title
        slug
        createdAt
        updatedAt
        tags
        description
        star
        excerpt
      }
    }
  `);

  return {
    posts: data?.posts || [],
    isLoading,
    isError: error,
  };
};

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
};
