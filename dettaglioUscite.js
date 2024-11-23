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

// Verifica l'autenticazione dell'utente prima di mostrare i dati
onAuthStateChanged(auth, (utente) => {
    if (utente) {
        console.log("Utente autenticato:", utente);
        mostraDettaglioUscitePerCategoria(); // Carica i dati se l'utente è autenticato
    } else {
        console.error("Errore: utente non autenticato, impossibile caricare i dati.");
        window.location.href = "index.html"; // Reindirizza alla pagina di login
    }
});

// Funzione per mostrare il dettaglio delle uscite per categoria
function mostraDettaglioUscitePerCategoria() {
    const meseFiltro = localStorage.getItem('meseFiltro') || new Date().toISOString().slice(0, 7);
    const annoSelezionato = meseFiltro.slice(0, 4);
    const uscitePerCategoria = {};

    const transazioniRef = ref(db, 'transazioni');

    onValue(transazioniRef, (snapshot) => {
        const transazioni = snapshot.val();

        if (transazioni) {
            for (let id in transazioni) {
                const transazione = transazioni[id];
                const annoTransazione = transazione.data.slice(0, 4);

                if (transazione.tipo === 'Uscita' && annoTransazione === annoSelezionato) {
                    if (uscitePerCategoria[transazione.categoria]) {
                        uscitePerCategoria[transazione.categoria] += parseFloat(transazione.importo);
                    } else {
                        uscitePerCategoria[transazione.categoria] = parseFloat(transazione.importo);
                    }
                }
            }

            const riepilogoDiv = document.getElementById('riepilogoUscitePerCategoria');
            riepilogoDiv.innerHTML = ''; // Pulisce il contenuto precedente

            if (Object.keys(uscitePerCategoria).length > 0) {
                for (let categoria in uscitePerCategoria) {
                    const importo = uscitePerCategoria[categoria].toFixed(2);
                    riepilogoDiv.innerHTML += `<p><strong>${categoria}:</strong> €${importo}</p>`;
                }

                // Crea il grafico delle uscite per categoria
                creaGraficoUscite(uscitePerCategoria);

            } else {
                riepilogoDiv.innerHTML = "<p>Nessuna uscita per l'anno selezionato.</p>";
            }
        } else {
            document.getElementById('riepilogoUscitePerCategoria').innerHTML = "<p>Nessun dato disponibile.</p>";
        }
    }, (error) => {
        console.error("Errore nel caricamento dei dati:", error);
    });
}

// Funzione per creare il grafico delle uscite per categoria
function creaGraficoUscite(uscitePerCategoria) {
    const categorie = Object.keys(uscitePerCategoria);
    const importi = Object.values(uscitePerCategoria);

    const ctx = document.getElementById('graficoUsciteCategoria').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorie,
            datasets: [{
                label: 'Spese per Categoria',
                data: importi,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(159, 159, 159, 1)',
                ],
                borderWidth: 1,
                borderRadius: 10,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Distribuzione Spese per Categoria',
                    font: {
                        size: 18,
                        family: 'Arial, sans-serif',
                        weight: 'bold'
                    },
                    color: '#333'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderWidth: 1,
                    borderColor: '#fff',
                    cornerRadius: 8,
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(200, 200, 200, 0.2)' },
                }
            }
        }
    });
}
