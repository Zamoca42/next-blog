import Container from "@/component/ui/container";
import { HeroPost } from "@/component/ui/hero-post";
import { Intro } from "@/component/ui/intro";
import { MoreStories } from "@/component/ui/more-stories";
import { Post } from "@/interface/post";
import { gql } from "graphql-request";
import Footer from "@/component/ui/footer";
import { graphQlClient, parseQuery } from "@/lib/graphql-request";

export default async function Index() {
  const query = parseQuery<{ posts: Post[] }>(gql`
    query {
      posts {
        title
        slug
        createdAt
        description
      }
    }
  `);
  const getAllPosts = await graphQlClient.request({
    document: query,
  });

  const allPosts = getAllPosts.posts;

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <div className="flex flex-col">
      <main>
        <Container>
          <Intro />
          <HeroPost
            title={heroPost.title}
            date={heroPost.createdAt}
            slug={heroPost.slug}
            description={heroPost.description}
          />
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
