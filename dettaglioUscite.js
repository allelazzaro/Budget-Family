import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

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
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Verifica autenticazione utente
onAuthStateChanged(auth, (utente) => {
    if (utente) {
        mostraDettaglioUscitePerCategoria();
    } else {
        window.location.href = "index.html";
    }
});

// Funzione per mostrare la suddivisione delle uscite per Alessio
function mostraDettaglioUscitePerCategoria() {
    const meseFiltro = localStorage.getItem('meseFiltro') || new Date().toISOString().slice(0, 7);
    const annoSelezionato = meseFiltro.slice(0, 4);

    // Aggiorna l'indicatore del periodo
    const periodoEl = document.getElementById('periodoVisualizzato');
    if (periodoEl) {
        periodoEl.textContent = `Anno ${annoSelezionato}`;
    }

    let spesePerCategoria = {};
    let totaleGenerale = { totale: 0, Alessio: 0 };
    let mesiConSpese = new Set(); // Traccia i mesi con almeno una spesa

    const transazioniRef = ref(db, 'transazioni');

    onValue(transazioniRef, (snapshot) => {
        const transazioni = snapshot.val();
        if (transazioni) {
            for (let id in transazioni) {
                const transazione = transazioni[id];
                const annoTransazione = transazione.data.slice(0, 4);

                if (transazione.tipo === 'Uscita' && annoTransazione === annoSelezionato) {
                    const importo = parseFloat(transazione.importo);
                    const categoria = transazione.categoria;
                    const meseTransazione = transazione.data.slice(0, 7); // YYYY-MM

                    // Aggiungi il mese al set dei mesi con spese
                    mesiConSpese.add(meseTransazione);

                    let pagatoDa = transazione.persona?.trim().toLowerCase();

                    if (!spesePerCategoria[categoria]) {
                        spesePerCategoria[categoria] = { totale: 0, Alessio: 0 };
                    }

                    spesePerCategoria[categoria].totale += importo;
                    totaleGenerale.totale += importo;

                    if (pagatoDa === "alessio") {
                        spesePerCategoria[categoria].Alessio += importo;
                        totaleGenerale.Alessio += importo;
                    }
                }
            }

            // Ordina le categorie dal totale più alto al più basso
            let categorieOrdinate = Object.entries(spesePerCategoria).sort((a, b) => {
                return b[1].totale - a[1].totale;
            });

            // Aggiorna le card di riepilogo
            aggiornaCardRiepilogo(totaleGenerale, categorieOrdinate.length);

            // Aggiorna le statistiche
            aggiornaStatistiche(categorieOrdinate, totaleGenerale, mesiConSpese.size);

            // Genera la tabella
            const suddivisioneDiv = document.getElementById('suddivisioneSpese');
            if (categorieOrdinate.length === 0) {
                suddivisioneDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <div class="empty-state-text">Nessuna uscita trovata</div>
                        <div class="empty-state-hint">Aggiungi delle uscite per vedere il dettaglio per categoria</div>
                    </div>
                `;
            } else {
                suddivisioneDiv.innerHTML = `
                    <table class="tabella-spese">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Totale (€)</th>
                                <th>Alessio (€)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categorieOrdinate.map(([categoria, spese]) => `
                                <tr>
                                    <td>${categoria}</td>
                                    <td>€${spese.totale.toFixed(2)}</td>
                                    <td>€${spese.Alessio.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td><strong>Totale</strong></td>
                                <td><strong>€${totaleGenerale.totale.toFixed(2)}</strong></td>
                                <td><strong>€${totaleGenerale.Alessio.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                `;
            }
        } else {
            // Nessuna transazione trovata
            document.getElementById('suddivisioneSpese').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">Nessuna transazione trovata</div>
                    <div class="empty-state-hint">Inizia ad aggiungere delle uscite nella home</div>
                </div>
            `;
        }
    }, (error) => {
        console.error("Errore nel caricamento dei dati:", error);
    });
}

// Funzione per aggiornare le card di riepilogo
function aggiornaCardRiepilogo(totaleGenerale, numeroCategorie) {
    const totaleGeneraleEl = document.getElementById('totaleGeneraleSpeso');
    const totaleAlessioEl = document.getElementById('totaleAlessio');
    const numeroCategorieEl = document.getElementById('numeroCategorie');

    if (totaleGeneraleEl) {
        totaleGeneraleEl.textContent = `€${totaleGenerale.totale.toFixed(2)}`;
    }

    if (totaleAlessioEl) {
        totaleAlessioEl.textContent = `€${totaleGenerale.Alessio.toFixed(2)}`;
    }

    if (numeroCategorieEl) {
        numeroCategorieEl.textContent = numeroCategorie;
    }
}

// Funzione per aggiornare le statistiche
function aggiornaStatistiche(categorieOrdinate, totaleGenerale, numeroMesi) {
    const categoriaTopEl = document.getElementById('categoriaTop');
    const spesaMediaEl = document.getElementById('spesaMedia');

    if (categorieOrdinate.length > 0) {
        // Categoria con spesa più alta
        const [categoriaTop, speseTop] = categorieOrdinate[0];
        if (categoriaTopEl) {
            categoriaTopEl.textContent = `${categoriaTop} (€${speseTop.totale.toFixed(2)})`;
        }

        // Spesa media mensile (totale / numero di mesi con spese)
        const spesaMedia = numeroMesi > 0 ? totaleGenerale.totale / numeroMesi : 0;
        if (spesaMediaEl) {
            spesaMediaEl.textContent = `€${spesaMedia.toFixed(2)}`;
        }
    } else {
        if (categoriaTopEl) categoriaTopEl.textContent = '-';
        if (spesaMediaEl) spesaMediaEl.textContent = '€0.00';
    }
}