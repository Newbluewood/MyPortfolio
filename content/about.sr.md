# O meni

**NBW** (New Blue Wood) je brending koji predstavlja ovaj portfolio na površini; iza toga sam ja **Nebojša Šimović** — developer fokusiran na **moderna frontendska rešenja**, **praktičan full‑stack** rad i **AI‑potpomognute** tokove rada.

Ovaj sajt povlači **live metapodatke projekata sa GitHub-a**, dodaje opcione **Netlify** podatke kada je token konfigurisan, i hostuje **CV** na [`/cv`](/cv). Plutajući **asistent** nije generički čatbot: koristi **retrieval‑augmented generation (RAG)** nad odabranim Markdown fajlovima iz `content/` ovog repozitorijuma (uključujući ovaj fajl) i ingestovanim **README** snimcima, tako da odgovori ostaju zasnovani na onome što je zaista napisano.

**Kako osvežiti šta asistent zna:** nakon izmene `content/*.md`, pokrenuti ingest CLI (`portfolio-ingest`) kao što je opisano u sekciji **Setup** u glavnom **README** repozitorijuma. To ažurira lokalni Chroma indeks koji API koristi pri upitu.

Ako prolazite brzo: počnite od [**Projekata**](/projects) za repoe i deploy linkove, [**CV**](/cv) za štampljivi rezime, i [**Kontakta**](/contact) da stupite u vezu.
