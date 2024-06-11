import Container from "@/component/ui/container";
import { HeroPost } from "@/component/home/hero-post";
import { Intro } from "@/component/home/intro";
import { MoreStories } from "@/component/home/more-stories";
import Footer from "@/component/home/footer";
import { getAllPosts } from "@/app/api/action";

export default async function Index() {
  const allPosts = await getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <div className="flex flex-col">
      <main>
        <Container>
          <Intro />
          <HeroPost date={heroPost.createdAt} {...heroPost} />
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
