// Importa i moduli necessari di Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
const transazioniRef = ref(db, 'transazioni');

// Funzione per calcolare e mostrare le uscite per categoria per l'anno selezionato
function mostraDettaglioUscitePerCategoria() {
    // Legge il filtro mese salvato nella pagina principale
    const meseFiltro = localStorage.getItem("meseFiltro") || new Date().toISOString().slice(0, 7);
    const annoSelezionato = meseFiltro.slice(0, 4); // Ottiene solo l'anno dal filtro mese
    const uscitePerCategoria = {};

    // Calcola le uscite per categoria per l'anno selezionato
    onValue(transazioniRef, (snapshot) => {
        const transazioni = snapshot.val();
        for (let id in transazioni) {
            const transazione = transazioni[id];
            const annoTransazione = transazione.data.slice(0, 4);

            // Verifica che sia una "Uscita" e che appartenga all'anno selezionato
            if (transazione.tipo === 'Uscita' && annoTransazione === annoSelezionato) {
                if (uscitePerCategoria[transazione.categoria]) {
                    uscitePerCategoria[transazione.categoria] += parseFloat(transazione.importo);
                } else {
                    uscitePerCategoria[transazione.categoria] = parseFloat(transazione.importo);
                }
            }
        }

        // Mostra i dati delle uscite per categoria
        const riepilogoDiv = document.getElementById('riepilogoUscitePerCategoria');
        riepilogoDiv.innerHTML = ''; // Pulisce eventuali contenuti precedenti
        for (let categoria in uscitePerCategoria) {
            const importo = uscitePerCategoria[categoria].toFixed(2);
            riepilogoDiv.innerHTML += `<p>${categoria}: €${importo}</p>`;
        }
    });
}

// Richiama la funzione per mostrare il dettaglio delle uscite al caricamento della pagina
window.onload = function() {
    mostraDettaglioUscitePerCategoria();
};
