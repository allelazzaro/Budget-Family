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
	    const nuovaRiga = `
                <tr>
                    <td>${transazione.persona}</td>
                    <td>${transazione.tipo}</td>
                    <td>${transazione.categoria || ''}</td>
                    <td>${transazione.descrizione || ''}</td>
                    <td>${dataFormattata}</td>
                    <td>€${parseFloat(transazione.importo).toFixed()}</td>
                    <td>
                        <button onclick="modificaTransazione('${id}')">Modifica</button>
                        <button onclick="cancellaTransazione('${id}')">Cancella</button>
                    </td>
                </tr>
            `;
            listaTransazioniElement.insertAdjacentHTML('beforeend', nuovaRiga);
        }
    });
}

// Funzione per aggiornare i riepiloghi totali e per persona
function aggiornaRiepiloghi() {
    let totaleEntrate = 0;
    let totaleUscite = 0;

    let totaleGiuliaEntrate = 0;
    let totaleGiuliaUscite = 0;
    let totaleAlessioEntrate = 0;
    let totaleAlessioUscite = 0;

    transazioni.forEach(([id, transazione]) => {
        if (transazione.tipo === 'Entrata') {
            totaleEntrate += transazione.importo;
            if (transazione.persona === 'Giulia') totaleGiuliaEntrate += transazione.importo;
            else if (transazione.persona === 'Alessio') totaleAlessioEntrate += transazione.importo;
        } else if (transazione.tipo === 'Uscita') {
            totaleUscite += transazione.importo;
            if (transazione.persona === 'Giulia') totaleGiuliaUscite += transazione.importo;
            else if (transazione.persona === 'Alessio') totaleAlessioUscite += transazione.importo;
        }
    });

    const saldoTotale = totaleEntrate - totaleUscite;
    const saldoGiulia = totaleGiuliaEntrate - totaleGiuliaUscite;
    const saldoAlessio = totaleAlessioEntrate - totaleAlessioUscite;

    document.getElementById('riepilogoEntrate').innerText = `Totale Entrate: €${totaleEntrate.toFixed(2)}`;
    document.getElementById('riepilogoUscite').innerText = `Totale Uscite: €${totaleUscite.toFixed(2)}`;
    document.getElementById('riepilogoSaldo').innerText = `Saldo Totale: €${saldoTotale.toFixed(2)}`;

    document.getElementById('riepilogoGiuliaEntrate').innerText = `Entrate Giulia: €${totaleGiuliaEntrate.toFixed(2)}`;
    document.getElementById('riepilogoGiuliaUscite').innerText = `Uscite Giulia: €${totaleGiuliaUscite.toFixed(2)}`;
    document.getElementById('riepilogoGiuliaSaldo').innerText = `Saldo Giulia: €${saldoGiulia.toFixed(2)}`;

    document.getElementById('riepilogoAlessioEntrate').innerText = `Entrate Alessio: €${totaleAlessioEntrate.toFixed(2)}`;
    document.getElementById('riepilogoAlessioUscite').innerText = `Uscite Alessio: €${totaleAlessioUscite.toFixed(2)}`;
    document.getElementById('riepilogoAlessioSaldo').innerText = `Saldo Alessio: €${saldoAlessio.toFixed(2)}`;
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
        <div>Entrate: €${totaleEntrateMese.toFixed(2)}</div>
        <div>Uscite: €${totaleUsciteMese.toFixed(2)}</div>
        <div>Saldo: €${saldoMese.toFixed(2)}</div>
    `;
}

// Filtra le transazioni per il mese selezionato
window.filtraPerMese = function () {
    const meseSelezionato = document.getElementById('meseFiltro').value;
    aggiornaListaTransazioni(meseSelezionato);
    aggiornaRiepilogoMensile();
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

    if (importo && !isNaN(importo)) {
        aggiungiTransazione(persona, 'Uscita', categoria, descrizione, importo, data);
        document.getElementById("descrizioneUscita").value = '';
        document.getElementById("importoUscita").value = '';
    } else {
        alert("Inserisci un importo valido per l'uscita.");
    }
};

// Funzione per cancellare una transazione
window.cancellaTransazione = function (id) {
    remove(ref(db, `transazioni/${id}`)).catch((error) => {
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
