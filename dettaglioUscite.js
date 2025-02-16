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
        window.location.href = "index.html"; // Reindirizza se non autenticato
    }
});

// Funzione per mostrare la suddivisione delle uscite tra Alessio e Giulia
function mostraDettaglioUscitePerCategoria() {
    const meseFiltro = localStorage.getItem('meseFiltro') || new Date().toISOString().slice(0, 7);
    const annoSelezionato = meseFiltro.slice(0, 4);

    let spesePerCategoria = {};
    let totaleGenerale = { totale: 0, Alessio: 0, Giulia: 0 };

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

                    let pagatoDa = transazione.persona?.trim().toLowerCase();

                    if (!spesePerCategoria[categoria]) {
                        spesePerCategoria[categoria] = { totale: 0, Alessio: 0, Giulia: 0 };
                    }

                    spesePerCategoria[categoria].totale += importo;
                    totaleGenerale.totale += importo;

                    if (pagatoDa === "alessio") {
                        spesePerCategoria[categoria].Alessio += importo;
                        totaleGenerale.Alessio += importo;
                    } else if (pagatoDa === "giulia") {
                        spesePerCategoria[categoria].Giulia += importo;
                        totaleGenerale.Giulia += importo;
                    }
                }
            }

            let categorieOrdinate = Object.entries(spesePerCategoria).sort((a, b) => {
                return b[1].totale - a[1].totale;
            });

            const suddivisioneDiv = document.getElementById('suddivisioneSpese');
            suddivisioneDiv.innerHTML = `
                <h2>Suddivisione Uscite</h2>
                <div class="tabella-container">
                    <table class="tabella-spese">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Totale (€)</th>
                                <th>Alessio (€)</th>
                                <th>Giulia (€)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categorieOrdinate.map(([categoria, spese]) => `
                                <tr>
                                    <td>${categoria}</td>
                                    <td><strong>€${spese.totale.toFixed(2)}</strong></td>
                                    <td>€${spese.Alessio.toFixed(2)}</td>
                                    <td>€${spese.Giulia.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="totale-riga">
                                <td><strong>Totale</strong></td>
                                <td><strong>€${totaleGenerale.totale.toFixed(2)}</strong></td>
                                <td><strong>€${totaleGenerale.Alessio.toFixed(2)}</strong></td>
                                <td><strong>€${totaleGenerale.Giulia.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <button id="btn-home" onclick="window.location.href='index.html'">
                    🔙 Torna alla Pagina Principale
                </button>
            `;
        }
    }, (error) => {
        console.error("Errore nel caricamento dei dati:", error);
    });
}
