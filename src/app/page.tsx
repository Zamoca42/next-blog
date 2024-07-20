import Container from "@/component/ui/container";
import { HeroPost } from "@/component/home/hero-post";
import { Intro } from "@/component/home/intro";
import Footer from "@/component/home/footer";
import { getAllPosts } from "@/app/api/action";

import dynamic from "next/dynamic";

const MoreStories = dynamic(() =>
  import("@/component/home/more-stories").then((mod) => mod.MoreStories)
);

export default async function Index() {
  const [heroPost, ...previews] = await getAllPosts();
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
