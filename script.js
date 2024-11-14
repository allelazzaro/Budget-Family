import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const transazioniRef = ref(db, 'transazioni'); // Riferimento alla collezione delle transazioni

let transazioni = [];

// Funzione per salvare il filtro mese selezionato nel localStorage
function salvaFiltroMese() {
    const meseFiltro = document.getElementById('meseFiltro').value;
    localStorage.setItem('meseFiltro', meseFiltro);
    filtraPerMese(); // aggiorna i dati della pagina principale in base al mese
}

// Associa la funzione al cambio del filtro mese
document.getElementById('meseFiltro').addEventListener('change', salvaFiltroMese);


// Funzione per ottenere la data corrente in formato 'YYYY-MM-DD'
function getDataCorrente() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
}

// Imposta la data corrente nei campi della data e nel filtro mese
function impostaDataCorrente() {
    const dataCorrente = getDataCorrente();
    document.getElementById('dataEntrata').value = dataCorrente;
    document.getElementById('dataUscita').value = dataCorrente;
    document.getElementById('meseFiltro').value = dataCorrente.slice(0, 7); // formato 'YYYY-MM'
}

// Ascolta i cambiamenti nel database e aggiorna le transazioni in tempo reale
onValue(transazioniRef, (snapshot) => {
    transazioni = snapshot.val() ? Object.entries(snapshot.val()) : [];
    aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
    aggiornaRiepiloghi();
    aggiornaRiepilogoMensile();
    aggiornaGraficoSpesePerCategoria();
});

// Funzione per aggiungere una transazione
function aggiungiTransazione(persona, tipo, categoria, descrizione, importo, data) {
    const nuovaTransazione = {
        persona,
        tipo,
        categoria: categoria || '',
        descrizione: descrizione || '',
        importo: parseFloat(importo),
        data
    };

    const nuovaTransazioneRef = push(transazioniRef);
    set(nuovaTransazioneRef, nuovaTransazione).catch((error) => {
        console.error("Errore nel salvataggio della transazione:", error);
    });
}


// Funzione per formattare la data in formato DD/MM/YYYY
function formattaData(data) {
    const [anno, mese, giorno] = data.split("-");
    return `${giorno}/${mese}`;
}

// Funzione per aggiornare la lista delle transazioni con filtro mese
function aggiornaListaTransazioni(meseFiltro = null) {
    const listaTransazioniElement = document.getElementById('listaTransazioni');
    listaTransazioniElement.innerHTML = ''; // Svuota la lista attuale

    transazioni.forEach(([id, transazione]) => {
        const transazioneMese = transazione.data.slice(0, 7);
        if (!meseFiltro || transazioneMese === meseFiltro) {
            const dataFormattata = formattaData(transazione.data);
            const classeTransazione = transazione.tipo === 'Uscita' ? 'uscita' : 'entrata';
            
            const nuovaRiga = `
                <tr>
                    <td>${transazione.persona}</td>
                    <td>${transazione.categoria || ''}</td>
                    <td>${transazione.descrizione || ''}</td>
                    <td>${dataFormattata}</td>
                    <td class="${classeTransazione}">€${parseFloat(transazione.importo).toFixed()}</td>
                    <td>
                        <button class="btn-azione" onclick="modificaTransazione('${id}')">Modifica</button>
                        <button class="btn-azione" onclick="cancellaTransazione('${id}')">Cancella</button>
                    </td>
                </tr>
            `;
            listaTransazioniElement.insertAdjacentHTML('beforeend', nuovaRiga);
        }
    });
}

// Funzione per aggiornare i riepiloghi totali e per persona filtrati per anno
function aggiornaRiepiloghi() {
    const meseFiltro = document.getElementById('meseFiltro').value;
    const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();

    let totaleEntrate = 0;
    let totaleUscite = 0;

    let totaleGiuliaEntrate = 0;
    let totaleGiuliaUscite = 0;
    let totaleAlessioEntrate = 0;
    let totaleAlessioUscite = 0;

    transazioni.forEach(([id, transazione]) => {
        const annoTransazione = transazione.data.slice(0, 4);
        
        // Filtra solo le transazioni dell'anno selezionato
        if (annoTransazione === annoSelezionato) {
            if (transazione.tipo === 'Entrata') {
                totaleEntrate += transazione.importo;
                if (transazione.persona === 'Giulia') totaleGiuliaEntrate += transazione.importo;
                else if (transazione.persona === 'Alessio') totaleAlessioEntrate += transazione.importo;
            } else if (transazione.tipo === 'Uscita') {
                totaleUscite += transazione.importo;
                if (transazione.persona === 'Giulia') totaleGiuliaUscite += transazione.importo;
                else if (transazione.persona === 'Alessio') totaleAlessioUscite += transazione.importo;
            }
        }
    });

    const saldoTotale = totaleEntrate - totaleUscite;
    const saldoGiulia = totaleGiuliaEntrate - totaleGiuliaUscite;
    const saldoAlessio = totaleAlessioEntrate - totaleAlessioUscite;

    document.getElementById('riepilogoEntrate').innerText = `Totale Entrate: €${totaleEntrate.toFixed()}`;
    document.getElementById('riepilogoUscite').innerText = `Totale Uscite: €${totaleUscite.toFixed()}`;
    document.getElementById('riepilogoSaldo').innerText = `Saldo Totale: €${saldoTotale.toFixed()}`;

    document.getElementById('riepilogoGiuliaEntrate').innerText = `Entrate Giulia: €${totaleGiuliaEntrate.toFixed()}`;
    document.getElementById('riepilogoGiuliaUscite').innerText = `Uscite Giulia: €${totaleGiuliaUscite.toFixed()}`;
    document.getElementById('riepilogoGiuliaSaldo').innerText = `Saldo Giulia: €${saldoGiulia.toFixed()}`;

    document.getElementById('riepilogoAlessioEntrate').innerText = `Entrate Alessio: €${totaleAlessioEntrate.toFixed(0)}`;
    document.getElementById('riepilogoAlessioUscite').innerText = `Uscite Alessio: €${totaleAlessioUscite.toFixed(0)}`;
    document.getElementById('riepilogoAlessioSaldo').innerText = `Saldo Alessio: €${saldoAlessio.toFixed(0)}`;
}

// Riepilogo mensile per il mese selezionato
function aggiornaRiepilogoMensile() {
    const meseSelezionato = document.getElementById('meseFiltro').value;
    let totaleEntrateMese = 0;
    let totaleUsciteMese = 0;

    transazioni.forEach(([id, transazione]) => {
        if (transazione.data.slice(0, 7) === meseSelezionato) {
            if (transazione.tipo === 'Entrata') totaleEntrateMese += transazione.importo;
            else if (transazione.tipo === 'Uscita') totaleUsciteMese += transazione.importo;
        }
    });

    const saldoMese = totaleEntrateMese - totaleUsciteMese;
    document.getElementById('riepilogoMese').innerHTML = `
        <div>Entrate: €${totaleEntrateMese.toFixed()}</div>
        <div>Uscite: €${totaleUsciteMese.toFixed()}</div>
        <div>Saldo: €${saldoMese.toFixed()}</div>
    `;
}

// Filtra le transazioni per il mese selezionato
window.filtraPerMese = function () {
    const meseSelezionato = document.getElementById('meseFiltro').value;
    aggiornaListaTransazioni(meseSelezionato);
    aggiornaRiepilogoMensile();
    aggiornaRiepiloghi(); // Aggiorna il riepilogo dettagliato per l'anno selezionato
    aggiornaGraficoSpesePerCategoria(); // Aggiorna il grafico per l'anno selezionato
    
};

// Funzioni per aggiungere entrate e uscite
window.aggiungiEntrata = function () {
    const persona = document.getElementById("personaEntrata").value;
    const tipo = document.getElementById("tipoEntrata").value;
    const importo = document.getElementById("importoEntrata").value;
    const data = document.getElementById("dataEntrata").value;

    if (importo && !isNaN(importo)) {
        aggiungiTransazione(persona, 'Entrata', tipo, '', importo, data);
        document.getElementById("importoEntrata").value = '';
            } else {
        alert("Inserisci un importo valido per l'entrata.");
    }
};

window.aggiungiUscita = function () {
    const persona = document.getElementById("personaUscita").value;
    const categoria = document.getElementById("categoriaUscita").value;
    const descrizione = document.getElementById("descrizioneUscita").value;
    const importo = document.getElementById("importoUscita").value;
    const data = document.getElementById("dataUscita").value;

    // Verifica che l'importo sia un numero e maggiore di zero
    if (!importo || isNaN(importo) || parseFloat(importo) <= 0) {
        alert("Inserisci un importo valido per l'uscita.");
        return; // Interrompe l'esecuzione se l'importo non è valido
    }

    // Se l'importo è valido, prosegue con l'inserimento della transazione
    aggiungiTransazione(persona, 'Uscita', categoria, descrizione, importo, data);

    // Pulisce i campi del modulo
    document.getElementById("descrizioneUscita").value = '';
    document.getElementById("importoUscita").value = '';
};


// Funzione per cancellare una transazione
window.cancellaTransazione = function (id) {
    remove(ref(db, `transazioni/${id}`))
        .then(() => {
            console.log("Transazione cancellata con successo");
            aggiornaRiepilogoCategoria(); // Aggiorna il riepilogo per categoria
            aggiornaRiepiloghi(); // Aggiorna gli altri riepiloghi se necessario
            aggiornaRiepilogoMensile(); // Aggiorna il riepilogo mensile se necessario
            aggiornaListaTransazioni(document.getElementById('meseFiltro').value); // Aggiorna la lista delle transazioni
        })
        .catch((error) => {
            console.error("Errore nella cancellazione della transazione:", error);
        });
};


// Funzione per modificare una transazione
window.modificaTransazione = function (id) {
    const nuovoImporto = prompt("Inserisci il nuovo importo:");
    if (nuovoImporto !== null && !isNaN(nuovoImporto) && nuovoImporto > 0) {
        const transazioneRef = ref(db, `transazioni/${id}`);
        update(transazioneRef, { importo: parseFloat(nuovoImporto) }).catch((error) => {
            console.error("Errore nella modifica della transazione:", error);
        });
    }
};

// Inizializza la data corrente e aggiorna i riepiloghi al caricamento della pagina
window.onload = function () {
    impostaDataCorrente();
};

let graficoTorta; // Variabile globale per il grafico a torta

function aggiornaGraficoSpesePerCategoria() {
    const meseFiltro = document.getElementById('meseFiltro').value;
    const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();

    // Raggruppa le spese per categoria, filtrando per l'anno selezionato
    const spesePerCategoria = {};
    transazioni.forEach(([id, transazione]) => {
        const annoTransazione = transazione.data.slice(0, 4);
        
        // Filtra solo le transazioni dell'anno selezionato
        if (transazione.tipo === 'Uscita' && annoTransazione === annoSelezionato) {
            if (spesePerCategoria[transazione.categoria]) {
                spesePerCategoria[transazione.categoria] += transazione.importo;
            } else {
                spesePerCategoria[transazione.categoria] = transazione.importo;
            }
        }
    });

    // Prepara i dati per il grafico
    const categorie = Object.keys(spesePerCategoria);
    const importi = Object.values(spesePerCategoria);

    // Distruggi il grafico precedente, se esiste
    if (graficoTorta) {
        graficoTorta.destroy();
    }

    // Crea un nuovo grafico a torta con i dati aggiornati
    const ctx = document.getElementById('graficoTortaSpese').getContext('2d');
    graficoTorta = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorie,
            datasets: [{
                label: 'Spese per Categoria',
                data: importi,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(199, 199, 199, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Distribuzione Spese per Categoria (${annoSelezionato})`
                }
            }
        }
    });
}
window.salvaNomeUtente = function () {
    const nomeUtente = document.getElementById('userName').value;
    localStorage.setItem('nomeUtente', nomeUtente);
    document.getElementById('personaEntrata').value = nomeUtente;
    document.getElementById('personaUscita').value = nomeUtente;
    document.getElementById('loginContainer').style.display = 'none'; // Nasconde il contenitore di login
}
window.aggiornaRiepilogoCategoria = function () {
    const categoriaSelezionata = document.getElementById('selezionaCategoria').value;
    const meseFiltro = document.getElementById('meseFiltro').value;
    const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();
    let totaleCategoria = 0;

    transazioni.forEach(([id, transazione]) => {
        const annoTransazione = transazione.data.slice(0, 4);

        // Filtra solo le transazioni dell'anno selezionato e somma solo le uscite
        if (
            annoTransazione === annoSelezionato &&
            transazione.tipo === 'Uscita' &&
            (categoriaSelezionata === "" || transazione.categoria === categoriaSelezionata)
        ) {
            const importo = parseFloat(transazione.importo);
            if (!isNaN(importo)) {
                totaleCategoria += importo;
            }
        }
    });

    document.getElementById('riepilogoCategoriaTotale').innerText = `Totale: €${totaleCategoria.toFixed(2)}`;
}


// Funzione per salvare il nome utente in localStorage
function salvaNomeUtente() {
    const nomeUtente = document.getElementById('userName').value;
    if (nomeUtente) {
        localStorage.setItem('nomeUtente', nomeUtente);
        aggiornaNomeUtente(nomeUtente);
    }
}

// Funzione per aggiornare i campi persona con il nome utente e nascondere il loginContainer
function aggiornaNomeUtente(nomeUtente) {
    document.getElementById('personaEntrata').value = nomeUtente;
    document.getElementById('personaUscita').value = nomeUtente;
    document.getElementById('loginContainer').style.display = 'none';
}

// Recupera il nome utente da localStorage all'avvio della pagina
window.onload = function () {
    const nomeUtente = localStorage.getItem('nomeUtente');
    if (nomeUtente) {
        aggiornaNomeUtente(nomeUtente);
    } else {
        document.getElementById('loginContainer').style.display = 'block'; // Mostra il loginContainer se il nome non è memorizzato
    }

}
// Chiama impostaDataCorrente al caricamento della pagina per impostare le date di default
window.onload = function () {
    impostaDataCorrente();
    const nomeUtente = localStorage.getItem('nomeUtente');
    if (nomeUtente) {
        aggiornaNomeUtente(nomeUtente);
    } else {
        document.getElementById('loginContainer').style.display = 'block';
    }
}
let transazioniVisibili = false; // Dichiara la variabile globale

window.toggleTransazioniVisibili = function () {
    transazioniVisibili = !transazioniVisibili;
    const container = document.getElementById('listaTransazioniContainer');
    if (container) {
        container.style.display = transazioniVisibili ? 'block' : 'none';
    }
    const toggleButton = document.getElementById('toggleButton');
    if (toggleButton) {
        toggleButton.innerText = transazioniVisibili ? "Nascondi Transazioni" : "Mostra Transazioni";
    }
    if (transazioniVisibili) {
        aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
    }
};
