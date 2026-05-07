/**
 * Objašnjenje zašto je Aang na Lab sceni + poštovanje autorskih prava na seriju/lik.
 */
export function AangAttribution() {
  return (
    <section
      id="aang-attribution"
      aria-labelledby="aang-attribution-heading"
      className="relative z-[30] mx-auto max-w-2xl px-4 pb-2 pt-4 sm:px-6"
    >
      <h2
        id="aang-attribution-heading"
        className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Zašto Aang?
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
        <p>
          Aang iz serije{" "}
          <cite className="not-italic text-zinc-300">
            Avatar: Poslednji vladar vetrova
          </cite>{" "}
          (<span lang="en">Avatar: The Last Airbender</span>) ostaje jedan od onih
          likova koji u sebi čuvaju dete — ne naivno, nego{" "}
          <strong className="font-medium text-zinc-300">neiskvareno i dobrog srca</strong>:
          kroz greške, strah i odgovornost uči, sluša druge i vraća se putu iako
          bi bilo lakše odustati. Na kraju izrasta iz begunca u nekoga ko{" "}
          <strong className="font-medium text-zinc-300">povezuje i ujedinjuje</strong>{" "}
          — snaga mu nije surovost, nego smirenje i izbor da štiti ono što je zajedničko.
          Tu metaforu nosim i u radu na projektima: rad, učenje iz iskustva i namena
          da nešto korisno za druge postane stabilno (kao ti „deploy“ oblaci oko njega).
        </p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Lik, naslovi i vizuelni svet serije u vlasništvu su nosilaca prava (npr.{" "}
          <span lang="en">Nickelodeon</span> / <span lang="en">Paramount</span>). Ovaj
          sajt ne koristi zvaničan materijal serije; referenca je kulturna i u duhu
          poštovanja prema autorskom delu.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href="https://en.wikipedia.org/wiki/Aang"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            Wikipedia — Aang
          </a>
          <a
            href="https://en.wikipedia.org/wiki/Avatar:_The_Last_Airbender"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            Wikipedia — serija
          </a>
        </p>
      </div>
    </section>
  );
}
