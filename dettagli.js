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

// Log di verifica dei parametri
console.log("Persona:", persona);
console.log("Tipo:", tipo);

if (!persona || !tipo) {
    alert("Parametri mancanti! Assicurati di passare 'persona' e 'tipo' nella query string.");
    window.location.href = "index.html";
}

// Imposta il titolo della pagina
const titoloDettagli = document.getElementById('titoloDettagli');
if (titoloDettagli) {
    titoloDettagli.innerText = `${tipo} di ${persona}`;
}

// Variabile per salvare le transazioni
let transazioni = {};

// Funzione per formattare la data in GG-MM-AA
function formattaData(data) {
    const [anno, mese, giorno] = data.split("-");
    return `${giorno}-${mese}-${anno}`;
}

// Funzione per mostrare le categorie ordinate o le entrate/uscite con il totale
function mostraCategorie() {
    console.log("Esecuzione di mostraCategorie...");
    if (!transazioni || Object.keys(transazioni).length === 0) {
        console.warn("Nessuna transazione disponibile.");
        document.getElementById('tabellaDettagli').innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; color: red;">
                    Nessun dato trovato per i criteri selezionati.
                </td>
            </tr>`;
        return;
    }

    // Sezione per visualizzare le entrate in ordine cronologico
    if (tipo.trim().toLowerCase() === "entrate") {
        const entrateFiltrate = Object.entries(transazioni)
            .map(([id, transazione]) => ({ id, ...transazione }))
            .filter(transazione =>
                transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
                transazione.tipo?.trim().toLowerCase() === "entrata"
            )
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        console.log("Entrate filtrate:", entrateFiltrate);

        const totaleEntrate = entrateFiltrate.reduce((totale, transazione) => totale + parseFloat(transazione.importo), 0);

        const tabellaDettagli = document.getElementById('tabellaDettagli');
        if (tabellaDettagli) {
            tabellaDettagli.innerHTML = entrateFiltrate.map(transazione => `
                <tr>
                    <td>${transazione.categoria || 'Senza Categoria'}</td>
                    <td>€${parseFloat(transazione.importo).toFixed(2)} - ${formattaData(transazione.data)}</td>
                </tr>
            `).join('');

            tabellaDettagli.innerHTML += `
                <tr style="font-weight: bold; background-color: #f0f0f0;">
                    <td style="text-align: right;">Totale</td>
                    <td>€${totaleEntrate.toFixed(2)}</td>
                </tr>`;
        }
        return;
    }

    // Sezione per visualizzare le uscite con il totale dell'anno selezionato
    const annoSelezionato = new Date().getFullYear().toString();
    const usciteFiltrate = Object.entries(transazioni)
        .map(([id, transazione]) => ({ id, ...transazione }))
        .filter(transazione =>
            transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
            transazione.tipo?.trim().toLowerCase() === "uscita" &&
            transazione.data.startsWith(annoSelezionato)
        );

    console.log("Uscite filtrate:", usciteFiltrate);

    const totaleUscite = usciteFiltrate.reduce((totale, transazione) => totale + parseFloat(transazione.importo), 0);

    const categorieTotali = {};
    usciteFiltrate.forEach(transazione => {
        const categoria = transazione.categoria || 'Senza Categoria';
        const importo = parseFloat(transazione.importo) || 0;

        if (!categorieTotali[categoria]) {
            categorieTotali[categoria] = 0;
        }
        categorieTotali[categoria] += importo;
    });

    const categorieOrdinate = Object.entries(categorieTotali).sort((a, b) => b[1] - a[1]);

    const tabellaDettagli = document.getElementById('tabellaDettagli');
    if (tabellaDettagli) {
        tabellaDettagli.innerHTML = categorieOrdinate.map(([categoria, totale]) => `
            <tr>
                <td>${categoria}</td>
                <td>€${totale.toFixed(2)}</td>
            </tr>
        `).join('');

        tabellaDettagli.innerHTML += `
            <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td style="text-align: right;">Totale</td>
                <td>€${totaleUscite.toFixed(2)}</td>
            </tr>`;
    }
}

// Recupera le transazioni dal database
const transazioniRef = ref(db, 'transazioni');
onValue(transazioniRef, (snapshot) => {
    transazioni = snapshot.val() || {};
    console.log("Transazioni recuperate:", transazioni);
    mostraCategorie();
}, (error) => {
    console.error("Errore nel recupero delle transazioni:", error);
    document.getElementById('tabellaDettagli').innerHTML = `
        <tr>
            <td colspan="2" style="text-align: center; color: red;">
                Errore nel recupero dei dati. Controlla la connessione.
            </td>
        </tr>`;
});

// Funzione per tornare alla pagina iniziale
window.tornaIndietro = function () {
    window.location.href = "index.html";
};
