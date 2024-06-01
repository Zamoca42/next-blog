import { GraphQLClient } from "graphql-request";

const endpoint = `http://localhost:3000`; //process.env.NEXT_PUBLIC_SITE_URL ?? 

const graphQlClient = new GraphQLClient(`${endpoint}/api/graphql`, {
  method: `GET`,
  credentials: `same-origin`,
  mode: `same-origin`,
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
});

export default graphQlClient;
