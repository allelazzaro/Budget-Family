import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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
const auth = getAuth(app);
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

// Funzione per aggiornare le statistiche in alto
function aggiornaStatistiche(totale, numeroCategorie, numeroTransazioni) {
    const totaleEl = document.getElementById('totaleGenerale');
    const numCategorieEl = document.getElementById('numeroCategorie');
    const numTransazioniEl = document.getElementById('numeroTransazioni');

    if (totaleEl) totaleEl.textContent = `€${totale.toFixed(2)}`;
    if (numCategorieEl) numCategorieEl.textContent = numeroCategorie;
    if (numTransazioniEl) numTransazioniEl.textContent = numeroTransazioni;
}

// Funzione per creare una card categoria espandibile
function creaCardCategoria(categoria, totaleCategoria, transazioni) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    // Header della card (cliccabile)
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
        <div class="category-info">
            <div>
                <span class="category-name">${categoria}</span>
                <span class="category-count">${transazioni.length} transazioni</span>
            </div>
            <div class="category-total">€${totaleCategoria.toFixed(2)}</div>
        </div>
        <div class="expand-icon">▼</div>
    `;

    // Contenuto della card (dettagli transazioni)
    const content = document.createElement('div');
    content.className = 'category-content';
    
    const transactionsList = document.createElement('div');
    transactionsList.className = 'transactions-list';
    
    // Ordina le transazioni per data (più recenti prima)
    const transazioniOrdinate = transazioni.sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    );
    
    // Crea gli item delle transazioni
    transazioniOrdinate.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="transaction-row">
                <span class="transaction-label">Descrizione:</span>
                <span class="transaction-value transaction-description">
                    ${t.descrizione || 'Nessuna descrizione'}
                </span>
            </div>
            <div class="transaction-row">
                <span class="transaction-label">Importo:</span>
                <span class="transaction-value transaction-amount">
                    €${parseFloat(t.importo).toFixed(2)}
                </span>
            </div>
            <div class="transaction-row">
                <span class="transaction-label">Data:</span>
                <span class="transaction-value transaction-date">
                    ${formattaData(t.data)}
                </span>
            </div>
        `;
        transactionsList.appendChild(item);
    });
    
    content.appendChild(transactionsList);
    
    // Event listener per espandere/comprimere
    header.addEventListener('click', () => {
        card.classList.toggle('expanded');
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
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
    const listaCategorie = document.getElementById('listaCategorie');
    listaCategorie.innerHTML = '';

    const annoSelezionato = getAnnoSelezionato();

    const entrateFiltrate = Object.entries(transazioni)
        .map(([id, transazione]) => ({ id, ...transazione }))
        .filter(transazione =>
            transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
            transazione.tipo?.trim().toLowerCase() === 'entrata' &&
            transazione.data.startsWith(annoSelezionato)
        );

    if (entrateFiltrate.length === 0) {
        listaCategorie.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-text">Nessuna entrata trovata</div>
                <div class="empty-state-hint">Aggiungi delle entrate nella home per vederle qui</div>
            </div>
        `;
        aggiornaStatistiche(0, 0, 0);
        return;
    }

    // Raggruppa per categoria
    const categorieMap = {};
    entrateFiltrate.forEach(t => {
        const cat = t.categoria || 'Senza Categoria';
        if (!categorieMap[cat]) categorieMap[cat] = [];
        categorieMap[cat].push(t);
    });

    // Calcola totali e ordina
    const categorieOrdinate = Object.entries(categorieMap)
        .map(([categoria, trans]) => ({
            categoria,
            totale: trans.reduce((sum, t) => sum + parseFloat(t.importo), 0),
            transazioni: trans
        }))
        .sort((a, b) => b.totale - a.totale);

    const totaleGenerale = categorieOrdinate.reduce((sum, cat) => sum + cat.totale, 0);

    // Aggiorna statistiche
    aggiornaStatistiche(totaleGenerale, categorieOrdinate.length, entrateFiltrate.length);

    // Crea le card
    categorieOrdinate.forEach(({ categoria, totale, transazioni }) => {
        const card = creaCardCategoria(categoria, totale, transazioni);
        listaCategorie.appendChild(card);
    });
}

// Funzione per mostrare le uscite
function mostraUscite() {
    const listaCategorie = document.getElementById('listaCategorie');
    listaCategorie.innerHTML = '';

    const annoSelezionato = getAnnoSelezionato();

    const usciteFiltrate = Object.entries(transazioni)
        .map(([id, transazione]) => ({ id, ...transazione }))
        .filter(transazione =>
            transazione.persona?.trim().toLowerCase() === persona.trim().toLowerCase() &&
            transazione.tipo?.trim().toLowerCase() === 'uscita' &&
            transazione.data.startsWith(annoSelezionato)
        );

    if (usciteFiltrate.length === 0) {
        listaCategorie.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💸</div>
                <div class="empty-state-text">Nessuna uscita trovata</div>
                <div class="empty-state-hint">Aggiungi delle uscite nella home per vederle qui</div>
            </div>
        `;
        aggiornaStatistiche(0, 0, 0);
        return;
    }

    // Raggruppa per categoria
    const categorieMap = {};
    usciteFiltrate.forEach(t => {
        const cat = t.categoria || 'Senza Categoria';
        if (!categorieMap[cat]) categorieMap[cat] = [];
        categorieMap[cat].push(t);
    });

    // Calcola totali e ordina
    const categorieOrdinate = Object.entries(categorieMap)
        .map(([categoria, trans]) => ({
            categoria,
            totale: trans.reduce((sum, t) => sum + parseFloat(t.importo), 0),
            transazioni: trans
        }))
        .sort((a, b) => b.totale - a.totale);

    const totaleGenerale = categorieOrdinate.reduce((sum, cat) => sum + cat.totale, 0);

    // Aggiorna statistiche
    aggiornaStatistiche(totaleGenerale, categorieOrdinate.length, usciteFiltrate.length);

    // Crea le card
    categorieOrdinate.forEach(({ categoria, totale, transazioni }) => {
        const card = creaCardCategoria(categoria, totale, transazioni);
        listaCategorie.appendChild(card);
    });
}

// Verifica autenticazione e recupera le transazioni
onAuthStateChanged(auth, (utente) => {
    if (utente) {
        // Utente autenticato, carica le transazioni
        onValue(ref(db, 'transazioni'), snapshot => {
            transazioni = snapshot.val() || {};
            mostraDettagli();
        }, (error) => {
            console.error("Errore caricamento transazioni:", error);
        });
    } else {
        // Utente non autenticato, torna alla home
        window.location.href = "index.html";
    }
});

// Funzione per tornare alla home
window.tornaIndietro = () => window.location.href = 'index.html';