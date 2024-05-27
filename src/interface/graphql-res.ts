interface GraphQLError {
  message: string;
  locations?: {
    line: number;
    column: number;
  }[];
  path?: string[];
}

export interface PostResponse<T> {
  posts?: T[];
  post?: T;
  errors?: GraphQLError[];
}
