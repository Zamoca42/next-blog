import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { parse } from "graphql";

export const parseQuery = <T>(
  query: string
): TypedDocumentNode<T, Record<any, never>> => {
  const parsedQuery: TypedDocumentNode<T, Record<any, never>> = parse(query);
  return parsedQuery
};
