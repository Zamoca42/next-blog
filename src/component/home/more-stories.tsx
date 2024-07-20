"use client";

import { useState } from "react";
import { PostPreview } from "@/component/post/post-preview";
import { Pagination } from "@/component/home/generate-pagination";
import { Button } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { Post } from "@/interface/post";
import { capitalize } from "@/lib/util";

type Params = {
  previews: Post[];
};

type FilterOption = {
  value: "all" | "star";
  count: (posts: Post[]) => number;
};

export function MoreStories({ previews: posts }: Params) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "star">("all");
  const postsPerPage = 5;

  if (!posts) return null;

  const starredPosts = posts.filter((post) => post.star === true);

  const filterOptions: FilterOption[] = [
    { value: "all", count: (posts) => posts.length },
    { value: "star", count: (posts) => starredPosts.length },
  ];

  const filteredPosts = selectedFilter === "all" ? posts : starredPosts;

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
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFilter === option.value ? "accent" : "ghost"}
            aria-label={option.value}
            onClick={() => {
              setSelectedFilter(option.value);
              setCurrentPage(1);
            }}
            className="space-x-2"
          >
            <span>{capitalize(option.value)}</span>
            <Badge variant="outline">{option.count(posts)}</Badge>
          </Button>
        ))}
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
