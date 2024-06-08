import { Post } from "@/interface/post";
import { PostPreview } from "@/component/post/post-preview";
import { blogConfig } from "@/blog.config";

type Props = {
  posts: Post[];
};

export function MoreStories({ posts }: Props) {
  return (
    <section>
      <h2 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
        More Stories
      </h2>
      <div className="grid grid-cols-1 gap-y-8 mb-16">
        {posts.map((post) => (
          <PostPreview
            date={post.createdAt}
            key={post.slug}
            {...post}
          />
        ))}
      </div>
    </section>
  );
}
