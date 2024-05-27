import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { Post } from "@/interfaces/post";
import { getGqlPost } from "@/lib/api";
import { gql } from "graphql-request";

export default async function Index() {
  const getAllPosts = await getGqlPost(gql`
    {
      posts {
        title
        slug
        date
        excerpt
        preview
        coverImage
        author {
          name
          picture
        }
      }
    }
  `);

  const allPosts = getAllPosts.posts as Post[];

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage || "/placeholder-image.jpg"}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </main>
  );
}
