import { HomeContent } from "@/components/home-content";
import { readMarkdownFile } from "@/lib/content";
import { getCvData } from "@/lib/cv-load";

export default async function HomePage() {
  const [aboutEn, aboutSr, skillsEn, skillsSr, cv] = await Promise.all([
    readMarkdownFile("about.md"),
    readMarkdownFile("about.sr.md"),
    readMarkdownFile("skills.md"),
    readMarkdownFile("skills.sr.md"),
    getCvData(),
  ]);

  return (
    <HomeContent
      aboutEn={aboutEn}
      aboutSr={aboutSr}
      skillsEn={skillsEn}
      skillsSr={skillsSr}
      credentials={cv.credentials}
    />
  );
}
