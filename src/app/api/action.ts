"use server";

import { parse } from "graphql";
import request from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

export const fetchGraphQL = async <T>(query: string): Promise<T> => {
  const parsedQuery: TypedDocumentNode<T, Record<any, never>> = parse(query);
  const endpoint = process.env.NEXT_PUBLIC_SITE_URL;
  console.log(endpoint)

  if (!endpoint) {
    throw new Error("GraphQL endpoint is not defined");
  }

  try {
    const res = await request(`${endpoint}/api/graphql`, parsedQuery);
    return res;
  } catch (error) {
    throw new Error(error as string);
  }
};
