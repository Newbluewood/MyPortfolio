import type { CvCredential, CvCredentialKind } from "@/lib/cv-schema";
import { T } from "@/components/translated-text";

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

/** Use JPG preview when legacy cv.json still points at a removed .pdf. */
function credentialAssetPath(file: string): string {
  return file.replace(/\.pdf$/i, ".jpg");
}

/** Compact equal-size cards in a row (home page). */
export function CvCredentials({ items }: { items: CvCredential[] }) {
  if (items.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scroll-smooth [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
      {items.map((c) => {
        const label = kindLabel(c.kind);
        const asset = credentialAssetPath(c.file);
        return (
          <a
            key={c.file}
            href={asset}
            target="_blank"
            rel="noopener noreferrer"
            title={c.title}
            className="group flex w-[7.5rem] shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] transition hover:border-cyan-500/35 hover:bg-white/[0.04] sm:w-[8.25rem]"
          >
            <div className="relative h-[5.5rem] w-full overflow-hidden bg-zinc-900/80">
              {/* eslint-disable-next-line @next/next/no-img-element -- static scans in public/ */}
              <img
                src={asset}
                alt=""
                className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex min-h-[3.25rem] flex-col gap-0.5 p-1.5">
              <span className="w-fit rounded border border-amber-500/20 bg-amber-500/10 px-1 py-px text-[8px] font-medium uppercase tracking-wide text-amber-200/90">
                <T en={label.en} sr={label.sr} />
              </span>
              <p className="line-clamp-2 text-[10px] font-medium leading-tight text-zinc-300 group-hover:text-white">
                <T en={c.title} sr={c.titleSr ?? c.title} />
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
