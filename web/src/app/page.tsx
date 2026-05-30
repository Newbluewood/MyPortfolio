import { HomeContent } from "@/components/home-content";
import { readMarkdownFile } from "@/lib/content";

export default async function HomePage() {
  const [aboutEn, aboutSr, skillsEn, skillsSr] = await Promise.all([
    readMarkdownFile("about.md"),
    readMarkdownFile("about.sr.md"),
    readMarkdownFile("skills.md"),
    readMarkdownFile("skills.sr.md"),
  ]);

  return (
    <HomeContent
      aboutEn={aboutEn}
      aboutSr={aboutSr}
      skillsEn={skillsEn}
      skillsSr={skillsSr}
    />
  );
}
