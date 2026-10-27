# Napomene o repozitorijumima (za asistenta)

Ovaj fajl se indeksira zajedno sa ostalim sadržajem u `content/`. Koristi ga kad README na GitHubu nema dovoljno teksta ili kad želiš da RAG zna više od onoga što piše u repou.

**Posle izmena** pokreni iz `api` foldera:

`portfolio-ingest`

Naslov sekcije mora da se poklopi sa **GitHub imenom repoa** (npr. `## Novi-Stolar-v1`).

---

## Novi-Stolar-v1

**Kratko:** pametni konfigurator kuhinjskih korpusa za malu stolarsku radionicu — krojna sa kantom, 3D, niz i L-kuhinja, predračun. Povezuje master iz prerade drveta sa softverom. Ne koristi GitHub About tekst „prva verzija sa dva dela“.

**Imena koja znače isti projekat:** Novi Stolar, Novi Stolar v1, Novi-Stolar-v1, novi-stolar-v1, Novi_Stolar_v1, kitchen cabinet configurator, krojna lista, planner kuhinje.

**Live sajt POSTOJI** (javno na Renderu). GitHub About → Website može biti prazan — to **nije** „nema live sajta“.

- Radionica: https://novi-stolar-v1.onrender.com
- Planner: https://novi-stolar-v1.onrender.com/planner

**Repo:** https://github.com/Newbluewood/Novi-Stolar-v1 — **privatan** (nije clone-za-posetioce). Kartica na `/projects` je ručna jer se privatni repo ne lista sa GitHub-a.

**Stack:** vanilla HTML/CSS/JS (ES moduli), Three.js, Python HTTP server, JSON katalozi, Google Gemini Vision za skicu prostorije. Nije React/Next aplikacija.

**Šta radi danas:** 11 golden šablona korpusa, krojna sa kantom, L-kuhinja (slepi i pravi ugao), materijali i override po instanci, radna ploča + plan tabli, predračun (m² / table / kant / okov), izvoz krojne i 3D JPEG/PDF, šeme bušenja za golden set. Status proizvoda: upotrebljiv za niz i L; U/ostrvo još nije pun motor.

**v2** (`Konstruktor_korpusa`) je TypeScript motor korpusa u istom GitHub repou — laboratorija, nije live demo. Live je uvek v1 na Renderu.

**Detalji za RAG:** `content/novi-stolar.md` (EN) i `content/novi-stolar.sr.md` (SR).

---

## ITA-ML

**Kratko:** određivanje sentimenta recenzija proizvoda. Kurs Introduction to Machine Learning using Python (ITAcademy). Ovo je sentiment projekat, ne onaj sa „Sentiment“ u imenu repoa.

**Repo:** https://github.com/Newbluewood/ITA-ML

**Šta radi:** iz naslova recenzije, teksta i dužine teksta predviđa sentiment. Podaci: `product_reviews_full.csv`.

**Stack:** Python, pandas, scikit-learn (TF-IDF + Random Forest), joblib (`model/sentiment_model.pkl`). Nije TensorFlow i nije neuronska mreža.

**Ne mešati sa:** `ML-SentimentModelForReviews` — taj repo predviđa kategoriju proizvoda iz naslova, ne sentiment recenzije.

---

## ML-SentimentModelForReviews

**Kratko:** predikcija kategorije proizvoda iz naslova (Product Title), oko 35 000 proizvoda. Ime repoa vara: ovo nije sentiment recenzija.

**Repo:** https://github.com/Newbluewood/ML-SentimentModelForReviews

**Stack:** Python, scikit-learn (TF-IDF, logistička regresija, Naive Bayes, Random Forest; najbolji na testu je Random Forest), joblib. Nije TensorFlow.

**Sentiment recenzija** je u repou `ITA-ML`.
