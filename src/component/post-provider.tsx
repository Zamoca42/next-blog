"use client";

import { getAllPosts } from "@/app/api/action";
import { Post } from "@/interface/post";
import { createContext, useContext, useEffect, useState } from "react";

interface PostsContextProps {
  allPosts: Post[];
}

const PostsContext = createContext<PostsContextProps>({
  allPosts: [],
});

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [allPosts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getAllPosts();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <PostsContext.Provider
      value={{
        allPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePostList = () => useContext(PostsContext);
