import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Panels } from "@/components/home/Panels";

export default function Home() {
  return (
    <>
      <div className="flex min-h-[calc(100svh-var(--topbar-h))] flex-col">
        <Hero />
        <Marquee />
      </div>
      <Panels />
    </>
  );
}
