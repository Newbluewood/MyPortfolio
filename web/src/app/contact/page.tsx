import { Section } from "@/components/section";
import { clientEnv } from "@/lib/env/client";

export const metadata = {
  title: "Contact",
  description: "Get in touch",
};

export default function ContactPage() {
  const { NEXT_PUBLIC_GITHUB_URL } = clientEnv;

  return (
    <Section eyebrow="Hello" title="Contact">
      <div className="max-w-xl break-words space-y-4 text-zinc-400">
        <p>
          Prefer reaching out through GitHub or your usual professional channel.
          For questions about projects or skills, try the assistant in the
          corner — it uses retrieval over this site&apos;s knowledge base.
        </p>
        {NEXT_PUBLIC_GITHUB_URL ? (
          <p>
            <a
              href={NEXT_PUBLIC_GITHUB_URL}
              className="font-medium text-cyan-400 underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open GitHub profile
            </a>
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Set <code className="font-mono text-zinc-400">NEXT_PUBLIC_GITHUB_URL</code>{" "}
            in your env to show a profile link here.
          </p>
        )}
      </div>
    </Section>
  );
}
