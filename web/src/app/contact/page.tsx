import { Section } from "@/components/section";
import { T } from "@/components/translated-text";
import { clientEnv } from "@/lib/env/client";

export const metadata = {
  title: "Contact",
  description: "Get in touch",
};

export default function ContactPage() {
  const { NEXT_PUBLIC_GITHUB_URL } = clientEnv;

  return (
    <Section eyebrow={<T en="Hello" sr="Zdravo" />} title={<T en="Contact" sr="Kontakt" />}>
      <div className="max-w-xl break-words space-y-4 text-zinc-400">
        <p>
          <T
            en="Prefer reaching out through GitHub or your usual professional channel. For questions about projects or skills, try the assistant in the corner — it uses retrieval over this site's knowledge base."
            sr="Javite se putem GitHub-a ili uobičajenog profesionalnog kanala. Za pitanja o projektima ili veštinama, probajte asistenta u uglu — koristi preuzimanje iz baze znanja sajta."
          />
        </p>
        {NEXT_PUBLIC_GITHUB_URL ? (
          <p>
            <a
              href={NEXT_PUBLIC_GITHUB_URL}
              className="font-medium text-cyan-400 underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <T en="Open GitHub profile" sr="Otvori GitHub profil" />
            </a>
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            <T
              en="Set NEXT_PUBLIC_GITHUB_URL in your env to show a profile link here."
              sr="Podesi NEXT_PUBLIC_GITHUB_URL u .env da bi se prikazao link ka profilu."
            />
          </p>
        )}
      </div>
    </Section>
  );
}
