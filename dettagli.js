import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configurazione Firebase
const firebaseConfig = {
    apiKey: "AIzaSyChK3rrqQ8hYygNLaahaxgtx8W1oUpxBP0",
    authDomain: "budget-a41a6.firebaseapp.com",
    databaseURL: "https://budget-a41a6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "budget-a41a6",
    storageBucket: "budget-a41a6.appspot.com",
    messagingSenderId: "1044297998779",
    appId: "1:1044297998779:web:3848d0c0c2b9840b66249e"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Recupera i parametri dalla query string
const urlParams = new URLSearchParams(window.location.search);
const persona = urlParams.get('persona');
const tipo = urlParams.get('tipo');

// Imposta il titolo della pagina
const titoloDettagli = document.getElementById('titoloDettagli');
if (titoloDettagli) {
    titoloDettagli.innerText = `${tipo} di ${persona}`;
}

// Variabile per salvare le transazioni
let transazioni = {};

// Funzione per formattare la data in GG-MM-AAAA
function formattaData(data) {
    const [anno, mese, giorno] = data.split("-");
    return `${giorno}-${mese}-${anno}`;
}

// Funzione per ottenere l'anno selezionato dal filtro
function getAnnoSelezionato() {
    const meseFiltro = localStorage.getItem('meseFiltro') || new Date().toISOString().slice(0, 7);
    return meseFiltro.slice(0, 4);
}

// Funzione principale per mostrare le entrate o uscite
function mostraDettagli() {
    if (tipo.trim().toLowerCase() === 'entrate') {
        mostraEntrate();
    } else if (tipo.trim().toLowerCase() === 'uscite') {
        mostraUscite();
    }
}

// Funzione per mostrare le entrate
function mostraEntrate() {
    const tabellaDettagli = document.getElementById('tabellaDettagli');
    tabellaDettagli.innerHTML = '';

    const annoSelezionato = getAnnoSelezionato();

    const entrateFiltrate = Object.entries(transazioni)
        .map(([id, transazione]) => ({ id, ...transazione }))
        .filter(transazione =>
            transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
            transazione.tipo?.trim().toLowerCase() === 'entrata' &&
            transazione.data.startsWith(annoSelezionato)
        );

    if (entrateFiltrate.length === 0) {
        tabellaDettagli.innerHTML = `<tr><td colspan="2" style="text-align: center; color: red;">Nessuna entrata trovata.</td></tr>`;
        return;
    }

    let totaleEntrate = 0;

    entrateFiltrate.forEach(transazione => {
        totaleEntrate += parseFloat(transazione.importo);
        tabellaDettagli.innerHTML += `
            <tr>
                <td>${transazione.categoria || 'Senza Categoria'}</td>
                <td>€${parseFloat(transazione.importo).toFixed(2)} - ${formattaData(transazione.data)}</td>
            </tr>
        `;
    });

    tabellaDettagli.innerHTML += `
        <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td style="text-align: right;">Totale</td>
            <td>€${totaleEntrate.toFixed(2)}</td>
        </tr>
    `;
}

// Funzione per mostrare le uscite con espansione dei dettagli
function mostraUscite() {
    const tabellaDettagli = document.getElementById('tabellaDettagli');
    tabellaDettagli.innerHTML = '';

    const annoSelezionato = getAnnoSelezionato();

    const usciteFiltrate = Object.entries(transazioni)
        .map(([id, transazione]) => ({ id, ...transazione }))
        .filter(transazione =>
            transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
            transazione.tipo?.trim().toLowerCase() === 'uscita' &&
            transazione.data.startsWith(annoSelezionato)
        );

    if (usciteFiltrate.length === 0) {
        tabellaDettagli.innerHTML = `<tr><td colspan="2" style="text-align: center; color: red;">Nessuna uscita trovata.</td></tr>`;
        return;
    }

    const categorieTotali = {};

    usciteFiltrate.forEach(transazione => {
        const categoria = transazione.categoria || 'Senza Categoria';
        if (!categorieTotali[categoria]) categorieTotali[categoria] = [];
        categorieTotali[categoria].push(transazione);
    });

    let totaleUscite = 0;

    Object.entries(categorieTotali).sort((a, b) => {
        const totaleA = a[1].reduce((sum, t) => sum + parseFloat(t.importo), 0);
        const totaleB = b[1].reduce((sum, t) => sum + parseFloat(t.importo), 0);
        return totaleB - totaleA;
    }).forEach(([categoria, transazioni]) => {
        const totaleCategoria = transazioni.reduce((sum, t) => sum + parseFloat(t.importo), 0);
        totaleUscite += totaleCategoria;

        const categoriaRow = document.createElement('tr');
        categoriaRow.innerHTML = `
            <td colspan="2" style="font-weight: bold; background-color: #007BFF; color: white; cursor: pointer;">
                ${categoria}: €${totaleCategoria.toFixed(2)}
            </td>
        `;
        tabellaDettagli.appendChild(categoriaRow);

        const dettagliRow = document.createElement('tr');
        dettagliRow.style.display = 'none';
        dettagliRow.innerHTML = `
            <td colspan="2" style="padding-left: 20px; background-color: #f9f9f9;">
                ${transazioni.map(t => `
                    <div><strong>Descrizione:</strong> ${t.descrizione || 'Nessuna descrizione'}<br>
                    <strong>Importo:</strong> €${parseFloat(t.importo).toFixed(2)}<br>
                    <strong>Data:</strong> ${formattaData(t.data)}</div>
                `).join('<hr>')}
            </td>
        `;
        tabellaDettagli.appendChild(dettagliRow);

        categoriaRow.addEventListener('click', () => {
            dettagliRow.style.display = dettagliRow.style.display === 'none' ? 'table-row' : 'none';
        });
    });

    tabellaDettagli.innerHTML += `
        <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td style="text-align: right;">Totale</td>
            <td>€${totaleUscite.toFixed(2)}</td>
        </tr>
    `;
}

// Recupera le transazioni dal database
onValue(ref(db, 'transazioni'), snapshot => {
    transazioni = snapshot.val() || {};
    mostraDettagli();
});

// Funzione per tornare alla home
window.tornaIndietro = () => window.location.href = 'index.html';
