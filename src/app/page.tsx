import Container from "@/component/ui/container";
import { HeroPost } from "@/component/home/hero-post";
import { Intro } from "@/component/home/intro";
import { MoreStories } from "@/component/home/more-stories";
import Footer from "@/component/home/footer";

export default function Index() {
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
