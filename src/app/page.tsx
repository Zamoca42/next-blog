import Container from "@/component/ui/container";
import { HeroPost } from "@/component/ui/hero-post";
import { Intro } from "@/component/ui/intro";
import { MoreStories } from "@/component/ui/more-stories";
import Footer from "@/component/ui/footer";
import { getAllPosts } from "@/lib/api";

export default async function Index() {
  // const query = parseQuery<{ posts: Post[] }>(gql`
  //   query {
  //     posts {
  //       title
  //       slug
  //       createdAt
  //       description
  //     }
  //   }
  // `);
  // const getAllPosts = await graphQlClient.request({
  //   document: query,
  // });

  // const allPosts = getAllPosts.posts;
  const allPosts = getAllPosts();

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
