import Container from "@/component/ui/container";
import { HeroPost } from "@/component/home/hero-post";
import { Intro } from "@/component/home/intro";
import { MoreStories } from "@/component/home/more-stories";
import Footer from "@/component/home/footer";
import { usePostList } from "@/component/post-provider";

export default function Index() {
  // const allPosts = await getAllPosts();
  // const heroPost = posts[0];

  // const morePosts = posts.slice(1);

  return (
    <div className="flex flex-col">
      <main>
        <Container>
          <Intro />
          <HeroPost />
          <MoreStories />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
