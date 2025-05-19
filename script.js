// Funzione per aprire le schede (tab)
function openTab(evt, tabName) {
    // Ottiene tutti gli elementi con classe "tabcontent" (i contenuti delle schede)
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"; // Nasconde tutti i contenuti delle schede
    }

    // Ottiene tutti gli elementi con classe "tablinks" (i bottoni delle schede)
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", ""); // Rimuove la classe "active" da tutti i bottoni
    }

    // Mostra il contenuto della scheda selezionata
    document.getElementById(tabName).style.display = "block";
    // Aggiunge la classe "active" al bottone della scheda cliccata
    evt.currentTarget.className += " active";
}

// Esegue codice quando il DOM (struttura HTML) è completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    // Prova a caricare la chiave API salvata dal localStorage
    const savedApiKey = localStorage.getItem('google_ai_api_key');
    if (savedApiKey) {
        // Se trovata, la imposta nel campo input
        document.getElementById('api-key').value = savedApiKey;
    }

    // Aggiunge un listener all'input della chiave API per salvarla quando cambia
    document.getElementById('api-key').addEventListener('change', (e) => {
        localStorage.setItem('google_ai_api_key', e.target.value);
    });
});

// Gestione del click sul pulsante di generazione
document.getElementById('generate-btn').addEventListener('click', async () => {
    // Ottiene il testo degli argomenti e rimuove spazi bianchi iniziali/finali
    const topicsText = document.getElementById('topics-input').value.trim();
    // Ottiene la chiave API e rimuove spazi bianchi
    const apiKey = document.getElementById('api-key').value.trim();
    // Elemento per mostrare messaggi di errore
    const errorElement = document.getElementById('error-message');

    // Nasconde eventuali messaggi di errore precedenti
    errorElement.classList.add('hidden');

    // Validazione: controlla se sono stati inseriti argomenti
    if (!topicsText) {
        errorElement.textContent = 'Inserisci almeno un argomento da studiare.';
        errorElement.classList.remove('hidden'); // Mostra il messaggio di errore
        return; // Interrompe l'esecuzione
    }

    // Validazione: controlla se è stata inserita la chiave API
    if (!apiKey) {
        errorElement.textContent = 'È necessaria una chiave API di Google AI Studio.';
        errorElement.classList.remove('hidden'); // Mostra il messaggio di errore
        return; // Interrompe l'esecuzione
    }

    // Divide il testo degli argomenti in un array, un argomento per riga, filtrando righe vuote
    const topics = topicsText.split('\n').filter(topic => topic.trim() !== '');

    // Disabilita il pulsante di generazione e cambia il testo durante l'elaborazione
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generazione in corso...';

    // Mostra gli indicatori di caricamento per ogni sezione di risultati
    showLoadingIndicator('overview');
    showLoadingIndicator('detailed');
    showLoadingIndicator('quiz');


    // Pulisce i risultati precedenti
    clearResults('overview');
    clearResults('detailed');
    clearResults('quiz');

    try {
        // Genera la panoramica per tutti gli argomenti
        await generateOverview(topics, apiKey);

        // Genera i dettagli per ogni argomento
        await generateDetailed(topics, apiKey);

        // Genera il quiz per ogni argomento
        await generateQuiz(topics, apiKey);

    } catch (error) {
        // Gestisce errori generali durante la generazione
        console.error('Errore durante la generazione:', error);
        errorElement.textContent = `Errore: ${error.message || 'Si è verificato un errore durante la comunicazione con l\'API.'}`;
        errorElement.classList.remove('hidden');
    } finally {
        // Riabilita il pulsante e ripristina il testo originale
        generateBtn.disabled = false;
        generateBtn.textContent = 'Genera Materiale di Studio';

        // Nasconde gli indicatori di caricamento (anche se la generazione ha successo, le singole funzioni li nascondono)
        // Questo è un fallback nel caso di errore prima che le funzioni specifiche completino.
        hideLoadingIndicator('overview');
        hideLoadingIndicator('detailed');
        hideLoadingIndicator('quiz');
    }
});

// Funzione per mostrare l'indicatore di caricamento per una specifica sezione
function showLoadingIndicator(sectionId) {
    document.getElementById(`${sectionId}-loading`).classList.remove('hidden');
}

// Funzione per nascondere l'indicatore di caricamento per una specifica sezione
function hideLoadingIndicator(sectionId) {
    document.getElementById(`${sectionId}-loading`).classList.add('hidden');
}

// Funzione per pulire i risultati di una specifica sezione
function clearResults(sectionId) {
    document.getElementById(`${sectionId}-results`).innerHTML = '';
}


// Funzione per generare la panoramica
async function generateOverview(topics, apiKey) {
    const sectionId = 'overview';
    const resultsContainer = document.getElementById(`${sectionId}-results`);
    showLoadingIndicator(sectionId); // Mostra caricamento specifico per questa sezione

    // Costruisce il prompt per l'AI
    const prompt = `Sei un tutor esperto che aiuta gli studenti a prepararsi per l'esame di maturità.
Crea una panoramica concisa ma completa dei seguenti argomenti, fornendo un output in formato Markdown:
${topics.join('\n')}

Per ogni argomento fornisci:
1.  Una breve descrizione (2-3 frasi)
2.  I concetti chiave da ricordare (3-5 punti elenco)
3.  Un consiglio su come studiare efficacemente questo argomento

Formatta la risposta in modo chiaro e leggibile, utilizzando titoli (es. # Titolo Argomento) e sottotitoli (es. ## Descrizione).`;

    try {
        // Chiama l'API di Google AI
        const response = await callGoogleAI(prompt, apiKey);

        // Crea un elemento div per il risultato
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-card'; // Applica stile
        resultDiv.innerHTML = `<div>${formatTextWithMarkdown(response)}</div>`; // Formatta e inserisce il testo

        // Aggiunge i bottoni di download
        addDownloadButtons(resultDiv, "panoramica_studio", response);

        resultsContainer.appendChild(resultDiv); // Aggiunge il risultato alla pagina
    } catch (error) {
        // Gestisce errori specifici per questa sezione
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `Errore nella generazione della panoramica: ${error.message}`;
        resultsContainer.appendChild(errorDiv);
        throw error; // Rilancia l'errore per gestirlo a livello superiore se necessario
    } finally {
        hideLoadingIndicator(sectionId); // Nasconde il caricamento specifico
    }
}

// Funzione per generare contenuti dettagliati per ogni argomento
async function generateDetailed(topics, apiKey) {
    const sectionId = 'detailed';
    const resultsContainer = document.getElementById(`${sectionId}-results`);
    showLoadingIndicator(sectionId); // Mostra caricamento

    // Itera su ogni argomento fornito
    for (const topic of topics) {
        // Costruisce il prompt per l'AI per l'argomento corrente
        const prompt = `Sei un insegnante esperto che prepara gli studenti per l'esame di maturità.
Crea una spiegazione dettagliata e approfondita dell'argomento: "${topic}", fornendo un output in formato Markdown.

Includi:
1.  Una spiegazione completa dell'argomento (usa paragrafi, elenchi puntati se necessario)
2.  Esempi pertinenti e casi di studio (se applicabile)
3.  Collegamenti con altri argomenti correlati (se rilevanti)
4.  Possibili domande d'esame su questo argomento e suggerimenti su come rispondere efficacemente

La spiegazione deve essere accurata, ben strutturata e utile per la preparazione all'esame. Usa titoli (es. # Spiegazione) e sottotitoli (es. ## Esempi).`;

        try {
            // Chiama l'API di Google AI
            const response = await callGoogleAI(prompt, apiKey);

            // Crea un elemento div per il risultato
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-card';
            // Inserisce il titolo dell'argomento e il contenuto formattato
            resultDiv.innerHTML = `
                <h3>${topic}</h3>
                <div>${formatTextWithMarkdown(response)}</div>
            `;

            // Aggiunge i bottoni di download
            addDownloadButtons(resultDiv, `dettaglio_${topic.replace(/\s+/g, '_')}`, response);

            resultsContainer.appendChild(resultDiv); // Aggiunge il risultato alla pagina
        } catch (error) {
            // Gestisce errori per l'argomento corrente
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = `Errore nella generazione dei dettagli per "${topic}": ${error.message}`;
            resultsContainer.appendChild(errorDiv);
            // Non rilanciare l'errore qui per permettere agli altri argomenti di essere processati
            console.error(`Errore dettagli per ${topic}:`, error);
        }
    }
    hideLoadingIndicator(sectionId); // Nasconde il caricamento al termine di tutti gli argomenti
}

// Funzione per generare quiz per ogni argomento
async function generateQuiz(topics, apiKey) {
    const sectionId = 'quiz';
    const resultsContainer = document.getElementById(`${sectionId}-results`);
    showLoadingIndicator(sectionId); // Mostra caricamento

    // Itera su ogni argomento
    for (const topic of topics) {
        // Costruisce il prompt per l'AI per il quiz
        const prompt = `Sei un insegnante che prepara quiz per gli studenti che affronteranno l'esame di maturità.
Crea un quiz di 5 domande sull'argomento: "${topic}", fornendo un output in formato Markdown.

Per ogni domanda:
1.  Scrivi la domanda (es. **Domanda 1:** ...)
2.  Fornisci 4 possibili risposte (A, B, C, D), solo una corretta (es. A) Opzione 1)
3.  Indica la risposta corretta (es. **Risposta Corretta:** C)
4.  Spiega brevemente perché quella è la risposta corretta (es. **Spiegazione:** ...)

Le domande devono coprire aspetti importanti dell'argomento che potrebbero essere richiesti all'esame.`;

        try {
            // Chiama l'API di Google AI
            const response = await callGoogleAI(prompt, apiKey);

            // Crea un elemento div per il risultato
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-card';
            // Inserisce il titolo del quiz e il contenuto formattato
            resultDiv.innerHTML = `
                <h3>Quiz: ${topic}</h3>
                <div>${formatTextWithMarkdown(response)}</div>
            `;
            // Aggiunge i bottoni di download
            addDownloadButtons(resultDiv, `quiz_${topic.replace(/\s+/g, '_')}`, response);

            resultsContainer.appendChild(resultDiv); // Aggiunge il risultato alla pagina
        } catch (error) {
            // Gestisce errori per il quiz dell'argomento corrente
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = `Errore nella generazione del quiz per "${topic}": ${error.message}`;
            resultsContainer.appendChild(errorDiv);
            console.error(`Errore quiz per ${topic}:`, error);
        }
    }
    hideLoadingIndicator(sectionId); // Nasconde il caricamento al termine
}


// Funzione per chiamare l'API di Google AI Studio (Gemini)
async function callGoogleAI(prompt, apiKey) {
    // URL dell'endpoint API per Gemini. Sostituire 'gemini-2.0-flash' con il modello desiderato se diverso.
    // NOTA: 'gemini-2.0-flash' non esiste al momento della scrittura. Potrebbe essere 'gemini-1.5-flash' o 'gemini-pro'.
    // Controlla la documentazione di Google AI Studio per il nome corretto del modello flash.
    // Assumendo un modello tipo "flash" per risposte rapide, se disponibile.
    // L'URL corretto è 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    // o 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

    // Corpo della richiesta API
    const requestBody = {
        contents: [{
            parts: [{
                text: prompt // Il prompt per l'AI
            }]
        }],
        generationConfig: {
            temperature: 0.3, // Controlla la "creatività" della risposta. Più basso = più deterministico.
            maxOutputTokens: 8192, // Massimo numero di token (parole/parti di parole) nella risposta.
            // topK: 1, // (Opzionale) Considera solo i token più probabili.
            // topP: 0.95, // (Opzionale) Nucleus sampling.
        },
        // (Opzionale) Impostazioni di sicurezza per filtrare contenuti dannosi.
        // safetySettings: [
        // {
        //     category: "HARM_CATEGORY_HARASSMENT",
        //     threshold: "BLOCK_MEDIUM_AND_ABOVE"
        // },
        // // ... altre categorie
        // ]
    };

    try {
        // Esegue la chiamata fetch all'API
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST', // Metodo HTTP
            headers: {
                'Content-Type': 'application/json' // Tipo di contenuto inviato
            },
            body: JSON.stringify(requestBody) // Converte l'oggetto requestBody in una stringa JSON
        });

        // Controlla se la risposta dell'API non è OK (es. errore 4xx o 5xx)
        if (!response.ok) {
            const errorData = await response.json(); // Prova a leggere il corpo dell'errore JSON
            // Lancia un errore con il messaggio dall'API o un messaggio generico
            throw new Error(errorData.error?.message || `Errore API (${response.status}): ${response.statusText}`);
        }

        // Converte la risposta JSON in un oggetto JavaScript
        const data = await response.json();

        // Estrae il testo generato dalla struttura della risposta dell'API
        // Controlla che la struttura della risposta sia quella attesa
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0 &&
            data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text; // Ritorna il testo generato
        } else if (data.candidates && data.candidates.length > 0 && data.candidates[0].finishReason === "SAFETY") {
            throw new Error('La risposta è stata bloccata per motivi di sicurezza (safety settings).');
        }
         else {
            console.warn("Struttura della risposta API inattesa:", data);
            throw new Error('Risposta API non valida o testo non trovato.');
        }
    } catch (error) {
        // Logga e rilancia l'errore per una gestione a livello superiore
        console.error('Errore durante la chiamata API a Google AI:', error);
        throw error;
    }
}

// Funzione per formattare il testo con una versione semplificata di Markdown in HTML
function formatTextWithMarkdown(text) {
    if (!text) return ''; // Gestisce input nullo o undefined

    let html = text;

    // Converte titoli (da # a ######)
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Grassetto (**) e corsivo (*)
    // Deve gestire correttamente casi come ***testo*** (grassetto e corsivo)
    // Prima il grassetto e corsivo insieme, poi il grassetto, poi il corsivo
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');


    // Elenchi puntati non ordinati (*, -, +)
    // Questo è complesso da fare perfettamente con regex semplici a causa del nesting
    // e della necessità di raggruppare gli <li> in <ul>.
    // Un approccio più semplice è convertire ogni riga e poi, se necessario,
    // avvolgere manualmente o con logica più complessa.
    // Per ora, conversione semplice di ogni riga:
    html = html.replace(/^\s*[-*+] (.*$)/gim, '<li>$1</li>');
    // Tentativo di raggruppare gli <li> in <ul>. Questo è rudimentale.
    // Potrebbe non funzionare correttamente con elenchi multipli o testo intermedio.
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*?<\/li>\s*)+/gis, (match) => `<ul>${match}</ul>`);
    }


    // Elenchi numerati (1., 2., ecc.)
    html = html.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    // Tentativo di raggruppare gli <li> in <ol>.
    if (html.includes('<li>') && /<ol>/.test(html) === false && /<ul>/.test(html) === false) { // Evita doppio wrapping
         html = html.replace(/(<li>.*?<\/li>\s*)+/gis, (match) => `<ol>${match}</ol>`);
    }


    // Linee orizzontali (---, ***, ___)
    html = html.replace(/^\s*(?:---|\*\*\*|___)\s*$/gm, '<hr>');

    // Paragrafi (converte le interruzioni di riga doppie in <p>)
    // Prima di tutto, normalizza le interruzioni di riga (CRLF, CR -> LF)
    html = html.replace(/\r\n?/g, '\n');
    // Poi divide in paragrafi. Le linee che non sono già in altri tag (es. <li>, <h1>)
    // dovrebbero diventare paragrafi.
    // Questo è il passaggio più complesso per un parser Markdown semplice.
    // Un approccio comune è splittare per \n\n e poi avvolgere ogni blocco.
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
        // Non avvolgere se è già un elemento blocco HTML o un elenco/titolo già convertito
        if (block.match(/^<(ul|ol|li|h[1-6]|hr|blockquote|pre|table)/i)) {
            return block;
        }
        return `<p>${block.replace(/\n/g, '<br>')}</p>`; // Converte singole \n in <br> dentro i <p>
    }).join('');

    // Rimuove <p> vuoti o <p><br></p>
    html = html.replace(/<p>\s*<\/p>/gi, '').replace(/<p><br\s*\/?>\s*<\/p>/gi, '');


    return html;
}


// Funzione per aggiungere i bottoni di download a un elemento risultato
function addDownloadButtons(resultCardElement, baseFileName, markdownContent) {
    // Contenitore per i bottoni di download
    const downloadButtonsDiv = document.createElement('div');
    downloadButtonsDiv.className = 'download-buttons';

    // Bottone per il download PDF
    const pdfButton = document.createElement('button');
    pdfButton.textContent = 'Scarica PDF';
    pdfButton.onclick = () => downloadAsPDF(resultCardElement.querySelector('div:not(.download-buttons)'), baseFileName); // Passa l'elemento con il contenuto HTML
    downloadButtonsDiv.appendChild(pdfButton);

    // Bottone per il download DOCX
    const docxButton = document.createElement('button');
    docxButton.textContent = 'Scarica DOCX';
    // Per DOCX, è meglio usare il contenuto HTML generato da Markdown,
    // poiché html-docx-js converte HTML in DOCX.
    const htmlContentForDocx = resultCardElement.querySelector('div:not(.download-buttons)').innerHTML;
    docxButton.onclick = () => downloadAsDOCX(htmlContentForDocx, baseFileName);
    downloadButtonsDiv.appendChild(docxButton);

    // Aggiunge il div dei bottoni alla card del risultato
    resultCardElement.appendChild(downloadButtonsDiv);
}

// Funzione per scaricare il contenuto come PDF
async function downloadAsPDF(elementToRender, fileName) {
    if (!window.jspdf || !window.html2canvas) {
        alert("Le librerie PDF (jsPDF, html2canvas) non sono caricate.");
        return;
    }
    const { jsPDF } = window.jspdf;

    // Mostra un messaggio all'utente perché html2canvas può richiedere tempo
    const originalButtonText = document.activeElement.textContent;
    if (document.activeElement.tagName === "BUTTON") {
        document.activeElement.textContent = "Creazione PDF...";
        document.activeElement.disabled = true;
    }

    try {
        // Usa html2canvas per catturare l'elemento come immagine
        const canvas = await html2canvas(elementToRender, {
            scale: 2, // Aumenta la scala per una migliore qualità
            useCORS: true, // Se ci sono immagini esterne
            logging: false // Disabilita i log di html2canvas in console
        });
        const imgData = canvas.toDataURL('image/png');

        // Crea un nuovo documento PDF
        // Dimensioni A4: 210mm x 297mm
        const pdf = new jsPDF({
            orientation: 'p', // portrait
            unit: 'mm',
            format: 'a4'
        });

        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calcola le dimensioni dell'immagine per adattarla alla pagina mantenendo le proporzioni
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;

        const ratio = Math.min( (pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight); // 10mm margin on each side

        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;

        // Centra l'immagine nella pagina
        const x = (pdfWidth - newWidth) / 2;
        const y = 10; // Margine superiore

        pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);
        pdf.save(`${fileName}.pdf`);

    } catch (error) {
        console.error("Errore durante la creazione del PDF:", error);
        alert("Si è verificato un errore durante la creazione del PDF.");
    } finally {
        if (document.activeElement.tagName === "BUTTON") {
            document.activeElement.textContent = originalButtonText;
            document.activeElement.disabled = false;
        }
    }
}


// Funzione per scaricare il contenuto come DOCX
function downloadAsDOCX(htmlContent, fileName) {
    if (!window.htmlDocx) {
         alert("La libreria DOCX (html-docx-js-typescript) non è caricata.");
        return;
    }

    // Prepara il contenuto HTML. html-docx-js si aspetta una stringa HTML completa.
    // Potrebbe essere necessario aggiungere tag <html>, <head>, <body> se non già presenti.
    // Per semplicità, usiamo direttamente l'innerHTML della card.
    // Potrebbe essere utile pulire l'HTML da elementi non necessari (es. bottoni di download stessi se fossero inclusi).
    const contentForDocx = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>${fileName}</title>
            <style>
                /* Stili base per il DOCX, html-docx-js ha un supporto limitato per CSS */
                body { font-family: Calibri, sans-serif; font-size: 11pt; }
                h1 { font-size: 16pt; font-weight: bold; }
                h2 { font-size: 14pt; font-weight: bold; }
                h3 { font-size: 12pt; font-weight: bold; }
                strong { font-weight: bold; }
                em { font-style: italic; }
                ul, ol { margin-left: 20px; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;


    try {
        // Genera il blob del file DOCX
        const fileBuffer = htmlDocx.asBlob(contentForDocx, {
            orientation: 'portrait', // 'landscape' o 'portrait'
            margins: { // in twips (1/20 di un punto)
                top: 720, // 0.5 pollici
                right: 720,
                bottom: 720,
                left: 720,
                header: 360,
                footer: 360,
                gutter: 0
            }
        });

        // Usa FileSaver.js (già incluso nell'HTML) per salvare il file
        saveAs(fileBuffer, `${fileName}.docx`);

    } catch (error) {
        console.error("Errore durante la creazione del DOCX:", error);
        alert("Si è verificato un errore durante la creazione del DOCX.");
    }
}