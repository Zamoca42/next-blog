import { parse } from "graphql";
import request from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";

export const fetchGraphQL = async <T>(query: string): Promise<T> => {
  const parsedQuery: TypedDocumentNode<T, Record<any, never>> = parse(query);

  try {
    const res = await request(
      `${process.env.NEXT_PUBLIC_URL}/api/graphql`,
      parsedQuery
    );
    return res;
  } catch (error) {
    throw new Error(error as string);
  }
};
