import Container from "@/component/ui/container";
import { HeroPost } from "@/component/home/hero-post";
import { Intro } from "@/component/home/intro";
import { MoreStories } from "@/component/home/more-stories";
import Footer from "@/component/home/footer";
import { getCachedPosts } from "@/app/api/action";

export default async function Index() {
  const [heroPost, ...previews] = await getCachedPosts();
  return (
    <div className="flex flex-col">
      <main>
        <Container>
          <Intro />
          <HeroPost post={heroPost} />
          <MoreStories previews={previews} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
