"use client";

import { useState } from "react";
import { PostPreview } from "@/component/post/post-preview";
import { Pagination } from "@/component/home/generate-pagination";
import { Button } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { usePostList } from "@/component/swr-provider";

export function MoreStories() {
  const { posts: allPosts } = usePostList();
  const [_heroPost, ...posts] = allPosts;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "star">("all");
  const postsPerPage = 10;

  if (!posts) return null;
  const starredPost = posts.filter((post) => post.star === true);
  const filteredPosts = selectedFilter === "all" ? posts : starredPost;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <section className="mb-12">
      <h2
        id="more-stories"
        className="mb-4 text-5xl md:text-7xl font-bold tracking-tighter leading-tight"
      >
        More Stories
      </h2>
      <div className="mb-4 space-x-2">
        <Button
          variant={selectedFilter === "all" ? "secondary" : "ghost"}
          onClick={() => setSelectedFilter("all")}
          className="space-x-2"
        >
          <span>All </span>
          <Badge variant="outline">{posts.length - 1}</Badge>
        </Button>
        <Button
          variant={selectedFilter === "star" ? "secondary" : "ghost"}
          onClick={() => {
            setSelectedFilter("star");
            setCurrentPage(1);
          }}
          className="space-x-2"
        >
          <span>Star</span>
          <Badge variant="outline">{starredPost.length}</Badge>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-y-8 mb-16 text-pretty">
        {currentPosts.map((post) => (
          <PostPreview date={post.createdAt} key={post.slug} {...post} />
        ))}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </section>
  );
}
