import type { CvCredential, CvCredentialKind } from "@/lib/cv-schema";
import { T } from "@/components/translated-text";

function isPdf(file: string): boolean {
  return file.toLowerCase().endsWith(".pdf");
}

function kindLabel(kind: CvCredentialKind): { en: string; sr: string } {
  switch (kind) {
    case "diploma":
      return { en: "Diploma", sr: "Diploma" };
    case "certificate":
      return { en: "Certificate", sr: "Sertifikat" };
    case "letter":
      return { en: "Letter", sr: "Zahvalnica" };
  }
}

export function CvCredentials({ items }: { items: CvCredential[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((c) => {
        const label = kindLabel(c.kind);
        return (
          <a
            key={c.file}
            href={c.file}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-cyan-500/30 hover:bg-white/[0.04]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900/80">
              {isPdf(c.file) ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-500">
                  <span className="text-3xl font-light text-cyan-500/80">PDF</span>
                  <span className="text-xs uppercase tracking-wider">
                    <T en="Document" sr="Dokument" />
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- static credential scans in public/
                <img
                  src={c.file}
                  alt=""
                  className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                />
              )}
            </div>
            <div className="space-y-1 p-3">
              <span className="inline-block rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/90">
                <T en={label.en} sr={label.sr} />
              </span>
              <p className="text-sm font-medium leading-snug text-zinc-200 group-hover:text-white">
                <T en={c.title} sr={c.titleSr ?? c.title} />
              </p>
              {c.period ? (
                <p className="text-xs text-zinc-500">{c.period}</p>
              ) : null}
              <p className="text-xs text-cyan-400/90 group-hover:text-cyan-300">
                <T en="Open document →" sr="Otvori dokument →" />
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
