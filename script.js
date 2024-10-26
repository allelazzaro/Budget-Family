let transazioni = [];

// Funzione per ottenere la data corrente in formato 'YYYY-MM-DD' (richiesto per gli input di tipo date)
function getDataCorrente() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0'); // I mesi vanno da 0 a 11
    const giorno = String(oggi.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
}

// Imposta la data corrente come valore predefinito per i campi di data
function impostaDataCorrente() {
    const dataCorrente = getDataCorrente();
    document.getElementById('dataEntrata').value = dataCorrente;
    document.getElementById('dataUscita').value = dataCorrente;
}

// Funzione per formattare la data in 'DD-MM-YYYY' per la visualizzazione
function formattaDataVisualizzazione(data) {
    const [anno, mese, giorno] = data.split('-');
    return `${giorno}-${mese}-${anno}`;
}

// Salva le transazioni nel database Firebase
function salvaTransazioni() {
    database.ref('transazioni').set(transazioni);
}

// Carica le transazioni dal database Firebase
function caricaDati() {
    database.ref('transazioni').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            transazioni = data;
            aggiornaListaTransazioni();
            aggiornaRiepiloghi();
        }
    });
}

// Funzione per aggiungere una transazione
function aggiungiTransazione(persona, tipo, categoria, descrizione, importo, data) {
    const mese = new Date(data).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    const dataFormattata = formattaDataVisualizzazione(data);
    transazioni.push({ mese, persona, tipo, categoria, descrizione, importo, data: dataFormattata });

    aggiornaListaTransazioni();
    aggiornaRiepiloghi();
    salvaTransazioni();
}

// Funzione per aggiornare i riepiloghi totali e per persona
function aggiornaRiepiloghi() {
    let totaleEntrate = 0;
    let totaleUscite = 0;

    let totaleGiuliaEntrate = 0;
    let totaleGiuliaUscite = 0;
    let totaleAlessioEntrate = 0;
    let totaleAlessioUscite = 0;

    transazioni.forEach(transazione => {
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

// Funzione per aggiungere un'entrata
function aggiungiEntrata() {
    const persona = document.getElementById("personaEntrata").value;
    const tipo = document.getElementById("tipoEntrata").value;
    const importo = parseFloat(document.getElementById("importoEntrata").value) || 0;
    const data = document.getElementById("dataEntrata").value;

    if (importo > 0) {
        aggiungiTransazione(persona, 'Entrata', tipo, '', importo, data);
        document.getElementById("importoEntrata").value = '';
        salvaTransazioni(); // Salva su Firebase
    } else {
        alert("Inserisci un importo valido per l'entrata.");
    }
}

// Funzione per aggiungere un'uscita
function aggiungiUscita() {
    const persona = document.getElementById("personaUscita").value;
    const categoria = document.getElementById("categoriaUscita").value;
    const descrizione = document.getElementById("descrizioneUscita").value;
    const importo = parseFloat(document.getElementById("importoUscita").value) || 0;
    const data = document.getElementById("dataUscita").value;

    if (importo > 0) {
        aggiungiTransazione(persona, 'Uscita', categoria, descrizione, importo, data);
        document.getElementById("descrizioneUscita").value = '';
        document.getElementById("importoUscita").value = '';
        salvaTransazioni(); // Salva su Firebase
    } else {
        alert("Inserisci un importo valido per l'uscita.");
    }
}

// Funzione per aggiornare la lista delle transazioni
function aggiornaListaTransazioni() {
    document.getElementById('listaTransazioni').innerHTML = '';
    transazioni.forEach((transazione, index) => {
        const nuovaRiga = `
            <tr>
                <td>${transazione.mese}</td>
                <td>${transazione.persona}</td>
                <td>${transazione.tipo}</td>
                <td>${transazione.categoria}</td>
                <td>${transazione.descrizione}</td>
                <td>${transazione.data}</td>
                <td>€${transazione.importo.toFixed(2)}</td>
                <td>
                    <button onclick="modificaTransazione(${index})">Modifica</button>
                    <button onclick="cancellaTransazione(${index})">Cancella</button>
                </td>
            </tr>
        `;
        document.getElementById('listaTransazioni').insertAdjacentHTML('beforeend', nuovaRiga);
    });
}

// Inizializza i dati al caricamento della pagina
window.onload = function() {
    caricaDati();
    impostaDataCorrente();
};
