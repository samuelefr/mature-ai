// Funzione per aprire le schede (tab)
function apriScheda(evento, nomeScheda) {
    const contenutiScheda = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < contenutiScheda.length; i++) {
        contenutiScheda[i].style.display = "none";
    }

    const bottoniScheda = document.getElementsByClassName("tablinks");
    for (let i = 0; i < bottoniScheda.length; i++) {
        bottoniScheda[i].className = bottoniScheda[i].className.replace(" active", "");
    }

    document.getElementById(nomeScheda).style.display = "block";
    evento.currentTarget.className += " active";
}

document.addEventListener('DOMContentLoaded', () => {
    const chiaveSalvata = localStorage.getItem('google_ai_api_key');
    if (chiaveSalvata) {
        document.getElementById('api-key').value = chiaveSalvata;
    }

    document.getElementById('api-key').addEventListener('change', (e) => {
        localStorage.setItem('google_ai_api_key', e.target.value);
    });
});

document.getElementById('generate-btn').addEventListener('click', async () => {
    const testoArgomenti = document.getElementById('topics-input').value.trim();
    const chiaveApi = document.getElementById('api-key').value.trim();
    const elementoErrore = document.getElementById('error-message');

    elementoErrore.classList.add('hidden');

    if (!testoArgomenti) {
        elementoErrore.textContent = 'Inserisci almeno un argomento da studiare.';
        elementoErrore.classList.remove('hidden');
        return;
    }

    if (!chiaveApi) {
        elementoErrore.textContent = 'È necessaria una chiave API di Google AI Studio.';
        elementoErrore.classList.remove('hidden');
        return;
    }

    const argomenti = testoArgomenti.split('\n').filter(argomento => argomento.trim() !== '');

    const bottoneGenera = document.getElementById('generate-btn');
    bottoneGenera.disabled = true;
    bottoneGenera.textContent = 'Generazione in corso...';

    mostraIndicatoreCaricamento('overview');
    mostraIndicatoreCaricamento('detailed');
    mostraIndicatoreCaricamento('quiz');

    pulisciRisultati('overview');
    pulisciRisultati('detailed');
    pulisciRisultati('quiz');

    try {
        await generaPanoramica(argomenti, chiaveApi);
        await generaDettagli(argomenti, chiaveApi);
        await generaQuiz(argomenti, chiaveApi);
    } catch (errore) {
        console.error('Errore durante la generazione:', errore);
        elementoErrore.textContent = `Errore: ${errore.message || 'Si è verificato un errore durante la comunicazione con l\'API.'}`;
        elementoErrore.classList.remove('hidden');
    } finally {
        bottoneGenera.disabled = false;
        bottoneGenera.textContent = 'Genera Materiale di Studio';
        nascondiIndicatoreCaricamento('overview');
        nascondiIndicatoreCaricamento('detailed');
        nascondiIndicatoreCaricamento('quiz');
    }
});

function mostraIndicatoreCaricamento(idSezione) {
    document.getElementById(`${idSezione}-loading`).classList.remove('hidden');
}

function nascondiIndicatoreCaricamento(idSezione) {
    document.getElementById(`${idSezione}-loading`).classList.add('hidden');
}

function pulisciRisultati(idSezione) {
    document.getElementById(`${idSezione}-results`).innerHTML = '';
}

async function generaPanoramica(argomenti, chiaveApi) {
    const idSezione = 'overview';
    const contenitoreRisultati = document.getElementById(`${idSezione}-results`);
    mostraIndicatoreCaricamento(idSezione);

    const prompt = `Sei un tutor esperto che aiuta gli studenti a prepararsi per l'esame di maturità.
Crea una panoramica concisa ma completa dei seguenti argomenti, fornendo un output in formato Markdown:
${argomenti.join('\n')}

Per ogni argomento fornisci:
1.  Una breve descrizione (2-3 frasi)
2.  I concetti chiave da ricordare (3-5 punti elenco)
3.  Un consiglio su come studiare efficacemente questo argomento

Formatta la risposta in modo chiaro e leggibile, utilizzando titoli (es. # Titolo Argomento) e sottotitoli (es. ## Descrizione).`;

    try {
        const risposta = await chiamaGoogleAI(prompt, chiaveApi);
        const divRisultato = document.createElement('div');
        divRisultato.className = 'result-card';
        divRisultato.innerHTML = `<div>${formattaMarkdown(risposta)}</div>`;
        aggiungiBottoniDownload(divRisultato, "panoramica_studio", risposta);
        contenitoreRisultati.appendChild(divRisultato);
    } catch (errore) {
        const divErrore = document.createElement('div');
        divErrore.className = 'error';
        divErrore.textContent = `Errore nella generazione della panoramica: ${errore.message}`;
        contenitoreRisultati.appendChild(divErrore);
        throw errore;
    } finally {
        nascondiIndicatoreCaricamento(idSezione);
    }
}

async function generaDettagli(argomenti, chiaveApi) {
    const idSezione = 'detailed';
    const contenitoreRisultati = document.getElementById(`${idSezione}-results`);
    mostraIndicatoreCaricamento(idSezione);

    for (const argomento of argomenti) {
        const prompt = `Sei un insegnante esperto che prepara gli studenti per l'esame di maturità.
Crea una spiegazione dettagliata e approfondita dell'argomento: "${argomento}", fornendo un output in formato Markdown.

Includi:
1.  Una spiegazione completa dell'argomento (usa paragrafi, elenchi puntati se necessario)
2.  Esempi pertinenti e casi di studio (se applicabile)
3.  Collegamenti con altri argomenti correlati (se rilevanti)
4.  Possibili domande d'esame su questo argomento e suggerimenti su come rispondere efficacemente

La spiegazione deve essere accurata, ben strutturata e utile per la preparazione all'esame. Usa titoli (es. # Spiegazione) e sottotitoli (es. ## Esempi).`;

        try {
            const risposta = await chiamaGoogleAI(prompt, chiaveApi);
            const divRisultato = document.createElement('div');
            divRisultato.className = 'result-card';
            divRisultato.innerHTML = `
                <h3>${argomento}</h3>
                <div>${formattaMarkdown(risposta)}</div>
            `;
            aggiungiBottoniDownload(divRisultato, `dettaglio_${argomento.replace(/\s+/g, '_')}`, risposta);
            contenitoreRisultati.appendChild(divRisultato);
        } catch (errore) {
            const divErrore = document.createElement('div');
            divErrore.className = 'error';
            divErrore.textContent = `Errore nella generazione dei dettagli per "${argomento}": ${errore.message}`;
            contenitoreRisultati.appendChild(divErrore);
            console.error(`Errore dettagli per ${argomento}:`, errore);
        }
    }
    nascondiIndicatoreCaricamento(idSezione);
}

async function generaQuiz(argomenti, chiaveApi) {
    const idSezione = 'quiz';
    const contenitoreRisultati = document.getElementById(`${idSezione}-results`);
    mostraIndicatoreCaricamento(idSezione);

    for (const argomento of argomenti) {
        const prompt = `Sei un insegnante che prepara quiz per gli studenti che affronteranno l'esame di maturità.
Crea un quiz di 5 domande sull'argomento: "${argomento}", fornendo un output in formato Markdown.

Per ogni domanda:
1.  Scrivi la domanda (es. **Domanda 1:** ...)
2.  Fornisci 4 possibili risposte (A, B, C, D), solo una corretta (es. A) Opzione 1)
3.  Indica la risposta corretta (es. **Risposta Corretta:** C)
4.  Spiega brevemente perché quella è la risposta corretta (es. **Spiegazione:** ...)

Le domande devono coprire aspetti importanti dell'argomento che potrebbero essere richiesti all'esame.`;

        try {
            const risposta = await chiamaGoogleAI(prompt, chiaveApi);
            const divRisultato = document.createElement('div');
            divRisultato.className = 'result-card';
            divRisultato.innerHTML = `
                <h3>Quiz: ${argomento}</h3>
                <div>${formattaMarkdown(risposta)}</div>
            `;
            aggiungiBottoniDownload(divRisultato, `quiz_${argomento.replace(/\s+/g, '_')}`, risposta);
            contenitoreRisultati.appendChild(divRisultato);
        } catch (errore) {
            const divErrore = document.createElement('div');
            divErrore.className = 'error';
            divErrore.textContent = `Errore nella generazione del quiz per "${argomento}": ${errore.message}`;
            contenitoreRisultati.appendChild(divErrore);
            console.error(`Errore quiz per ${argomento}:`, errore);
        }
    }
    nascondiIndicatoreCaricamento(idSezione);
}

async function chiamaGoogleAI(prompt, chiaveApi) {
    const urlApi = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

    const corpoRichiesta = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
        },
    };

    try {
        const risposta = await fetch(`${urlApi}?key=${chiaveApi}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(corpoRichiesta)
        });

        if (!risposta.ok) {
            const datiErrore = await risposta.json();
            throw new Error(datiErrore.error?.message || `Errore API (${risposta.status}): ${risposta.statusText}`);
        }

        const dati = await risposta.json();

        if (dati.candidates && dati.candidates.length > 0 &&
            dati.candidates[0].content &&
            dati.candidates[0].content.parts &&
            dati.candidates[0].content.parts.length > 0 &&
            dati.candidates[0].content.parts[0].text) {
            return dati.candidates[0].content.parts[0].text;
        } else if (dati.candidates && dati.candidates.length > 0 && dati.candidates[0].finishReason === "SAFETY") {
            throw new Error('La risposta è stata bloccata per motivi di sicurezza (safety settings).');
        }
         else {
            console.warn("Struttura della risposta API inattesa:", dati);
            throw new Error('Risposta API non valida o testo non trovato.');
        }
    } catch (errore) {
        console.error('Errore durante la chiamata API a Google AI:', errore);
        throw errore;
    }
}

function formattaMarkdown(testo) {
    if (!testo) return '';

    let html = testo;

    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    html = html.replace(/^\s*[-*+] (.*$)/gim, '<li>$1</li>');
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*?<\/li>\s*)+/gis, (match) => `<ul>${match}</ul>`);
    }

    html = html.replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    if (html.includes('<li>') && /<ol>/.test(html) === false && /<ul>/.test(html) === false) {
         html = html.replace(/(<li>.*?<\/li>\s*)+/gis, (match) => `<ol>${match}</ol>`);
    }

    html = html.replace(/^\s*(?:---|\*\*\*|___)\s*$/gm, '<hr>');

    html = html.replace(/\r\n?/g, '\n');
    const blocchi = html.split(/\n\n+/);
    html = blocchi.map(blocco => {
        if (blocco.match(/^<(ul|ol|li|h[1-6]|hr|blockquote|pre|table)/i)) {
            return blocco;
        }
        return `<p>${blocco.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    html = html.replace(/<p>\s*<\/p>/gi, '').replace(/<p><br\s*\/?>\s*<\/p>/gi, '');

    return html;
}

function aggiungiBottoniDownload(elementoRisultato, nomeBaseFile, contenutoMarkdown) {
    const divBottoni = document.createElement('div');
    divBottoni.className = 'download-buttons';

    const bottonePdf = document.createElement('button');
    bottonePdf.textContent = 'Scarica PDF';
    bottonePdf.onclick = () => scaricaPDF(elementoRisultato.querySelector('div:not(.download-buttons)'), nomeBaseFile);
    divBottoni.appendChild(bottonePdf);

    const bottoneDocx = document.createElement('button');
    bottoneDocx.textContent = 'Scarica DOCX';
    const contenutoHtmlDocx = elementoRisultato.querySelector('div:not(.download-buttons)').innerHTML;
    bottoneDocx.onclick = () => scaricaDOCX(contenutoHtmlDocx, nomeBaseFile);
    divBottoni.appendChild(bottoneDocx);

    elementoRisultato.appendChild(divBottoni);
}

async function scaricaPDF(elementoDaRenderizzare, nomeFile) {
    if (!window.jspdf || !window.html2canvas) {
        alert("Le librerie PDF (jsPDF, html2canvas) non sono caricate.");
        return;
    }
    const { jsPDF } = window.jspdf;

    const testoOriginaleBottone = document.activeElement.textContent;
    if (document.activeElement.tagName === "BUTTON") {
        document.activeElement.textContent = "Creazione PDF...";
        document.activeElement.disabled = true;
    }

    try {
        const canvas = await html2canvas(elementoDaRenderizzare, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps= pdf.getImageProperties(imgData);
        const larghezzaPdf = pdf.internal.pageSize.getWidth();
        const altezzaPdf = pdf.internal.pageSize.getHeight();

        const larghezzaImg = imgProps.width;
        const altezzaImg = imgProps.height;

        const rapporto = Math.min( (larghezzaPdf - 20) / larghezzaImg, (altezzaPdf - 20) / altezzaImg);

        const nuovaLarghezza = larghezzaImg * rapporto;
        const nuovaAltezza = altezzaImg * rapporto;

        const x = (larghezzaPdf - nuovaLarghezza) / 2;
        const y = 10;

        pdf.addImage(imgData, 'PNG', x, y, nuovaLarghezza, nuovaAltezza);
        pdf.save(`${nomeFile}.pdf`);

    } catch (errore) {
        console.error("Errore durante la creazione del PDF:", errore);
        alert("Si è verificato un errore durante la creazione del PDF.");
    } finally {
        if (document.activeElement.tagName === "BUTTON") {
            document.activeElement.textContent = testoOriginaleBottone;
            document.activeElement.disabled = false;
        }
    }
}

function scaricaDOCX(contenutoHtml, nomeFile) {
    if (!window.htmlDocx) {
         alert("La libreria DOCX (html-docx-js-typescript) non è caricata.");
        return;
    }

    const contenutoPerDocx = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>${nomeFile}</title>
            <style>
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
            ${contenutoHtml}
        </body>
        </html>
    `;

    try {
        const fileBuffer = htmlDocx.asBlob(contenutoPerDocx, {
            orientation: 'portrait',
            margins: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
                header: 360,
                footer: 360,
                gutter: 0
            }
        });

        saveAs(fileBuffer, `${nomeFile}.docx`);

    } catch (errore) {
        console.error("Errore durante la creazione del DOCX:", errore);
        alert("Si è verificato un errore durante la creazione del DOCX.");
    }
}
// Animazione di esempio con GSAP

gsap.to(".header img", {rotation:340, x: -200, y: -180, duration: 2, delay: 1});