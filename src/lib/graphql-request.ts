import { GraphQLClient } from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { parse } from "graphql";

const graphQlClient = new GraphQLClient(
  `${
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000`
      : process.env.VERCEL_ENV === "development"
      ? `https://localhost:3000`
      : process.env.VERCEL_URL
  }/api/graphql`,
  {
    method: `GET`,
    jsonSerializer: {
      parse: JSON.parse,
      stringify: JSON.stringify,
    },
  }
);

const parseQuery = <T>(
  query: string
): TypedDocumentNode<T, Record<any, never>> => {
  const parsedQuery: TypedDocumentNode<T, Record<any, never>> = parse(query);
  return parsedQuery;
};

export { parseQuery, graphQlClient };
