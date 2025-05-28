# Maturità AI Helper

Maturità AI Helper è una web app che aiuta gli studenti a prepararsi per l'esame di maturità generando materiale di studio, spiegazioni dettagliate e quiz personalizzati tramite l'intelligenza artificiale di Google AI Studio.

---

## Funzionalità principali

- **Generazione panoramica**: Breve descrizione, concetti chiave e consigli di studio per ogni argomento.
- **Spiegazioni dettagliate**: Approfondimenti, esempi, collegamenti e possibili domande d’esame.
- **Quiz personalizzati**: 5 domande a risposta multipla per ogni argomento, con spiegazione delle risposte.
- **Download**: Esporta i risultati in PDF o DOCX.
- **Salvataggio locale della chiave API**: La chiave API viene salvata solo nel browser dell’utente.

---

## Come funziona la logica dell’applicazione

1. **Input dell’utente**
   - L’utente inserisce una lista di argomenti (uno per riga) e la propria API Key di Google AI Studio.
2. **Avvio della generazione**
   - Cliccando su "Genera Materiale di Studio", il sistema valida i dati e mostra indicatori di caricamento.
3. **Chiamata all’API di Google AI**
   - Per ogni sezione (Panoramica, Dettagli, Quiz), viene costruito un prompt specifico e inviato all’API di Google AI Studio.
   - Le risposte vengono ricevute in formato Markdown.
4. **Formattazione e visualizzazione**
   - Il Markdown viene convertito in HTML per una visualizzazione chiara.
   - I risultati sono suddivisi in tre tab: Panoramica, Dettagli, Quiz.
5. **Download dei risultati**
   - Ogni risultato può essere scaricato in PDF o DOCX tramite i bottoni dedicati.
6. **Navigazione a tab**
   - L’utente può passare tra le sezioni tramite una barra di navigazione a tab.
7. **Animazioni**
   - Il logo viene animato all’avvio tramite GSAP.

---

## Come si usa

1. **Scarica o clona il progetto** e apri `index.html` in un browser moderno.
2. **Inserisci gli argomenti** da studiare (uno per riga).
3. **Inserisci la tua API Key** di Google AI Studio ([come ottenerla](https://aistudio.google.com/app/apikey)).
4. Clicca su **"Genera Materiale di Studio"**.
5. Naviga tra le tab "Panoramica", "Dettagli" e "Quiz".
6. Scarica i risultati in PDF o DOCX.

---

## Requisiti

- Browser moderno (Chrome, Firefox, Edge, Safari)
- [API Key di Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Struttura del progetto

- `index.html` — Pagina principale dell'applicazione
- `style.css` — Stili grafici
- `script.js` — Logica JavaScript per interazione, chiamate API e generazione risultati
- `img/1f393.png` — Logo

---

## Librerie utilizzate

- [FileSaver.js](https://github.com/eligrey/FileSaver.js) — Salvataggio file
- [html-docx-js-typescript](https://www.npmjs.com/package/html-docx-js-typescript) — Generazione DOCX
- [html2canvas](https://html2canvas.hertzen.com/) — Screenshot HTML per PDF
- [jsPDF](https://github.com/parallax/jsPDF) — Generazione PDF
- [GSAP](https://greensock.com/gsap/) — Animazioni
- [Anime.js](https://animejs.com/) — Animazioni

---

**Nota:**  
Nessun dato viene inviato o salvato su server esterni, eccetto le richieste all’API di Google AI Studio.  
La chiave API viene salvata solo localmente nel browser.
