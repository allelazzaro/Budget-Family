let transazioni = [];


// Funzione per ottenere la data corrente in formato 'YYYY-MM-DD'
function getDataCorrente() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
}

// Imposta la data corrente come valore predefinito per i campi di data e filtro mese
function impostaDataCorrente() {
    const dataCorrente = getDataCorrente();
    document.getElementById('dataEntrata').value = dataCorrente;
    document.getElementById('dataUscita').value = dataCorrente;
    
    const meseCorrente = dataCorrente.slice(0, 7); // formato YYYY-MM
    document.getElementById('meseFiltro').value = meseCorrente;
    filtraPerMese(); // Applica il filtro per il mese corrente al caricamento
}

// Funzione per formattare la data in 'DD-MM-YYYY'
function formattaDataVisualizzazione(data) {
    const [anno, mese, giorno] = data.split('-');
    return `${giorno}-${mese}-${anno}`;
}

// Aggiunge una transazione
function aggiungiTransazione(persona, tipo, categoria, descrizione, importo, data) {
    const mese = data.slice(0, 7); // Estrarre mese in formato 'YYYY-MM'
    const dataFormattata = formattaDataVisualizzazione(data);
    
    transazioni.push({
        mese: mese,
        persona: persona,
        tipo: tipo,
        categoria: categoria,
        descrizione: descrizione,
        importo: parseFloat(importo),  // Assicurarsi che l'importo sia numerico
        data: dataFormattata
    });

    const meseFiltro = document.getElementById('meseFiltro').value;
    aggiornaListaTransazioni(meseFiltro);  // Aggiorna la lista con il filtro del mese selezionato
    aggiornaRiepiloghi();
    salvaTransazioni();
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
    } else {
        alert("Inserisci un importo valido per l'uscita.");
    }
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

    aggiornaRiepilogoMensile(); // Aggiorna anche il riepilogo mensile
}

// Riepilogo mensile per il mese selezionato
function aggiornaRiepilogoMensile() {
    const meseSelezionato = document.getElementById('meseFiltro').value;
    let totaleEntrateMese = 0;
    let totaleUsciteMese = 0;

    transazioni.forEach(transazione => {
        if (transazione.mese === meseSelezionato) {
            if (transazione.tipo === 'Entrata') {
                totaleEntrateMese += transazione.importo;
            } else if (transazione.tipo === 'Uscita') {
                totaleUsciteMese += transazione.importo;
            }
        }
    });

    const saldoMese = totaleEntrateMese - totaleUsciteMese;
    const riepilogoHtml = `
        <div>Entrate: €${totaleEntrateMese.toFixed(2)}</div>
        <div>Uscite: €${totaleUsciteMese.toFixed(2)}</div>
        <div>Saldo: €${saldoMese.toFixed(2)}</div>
    `;

    document.getElementById('riepilogoMese').innerHTML = riepilogoHtml;
}

// Filtra le transazioni per il mese selezionato e aggiorna la lista
function filtraPerMese() {
    const meseSelezionato = document.getElementById('meseFiltro').value;
    aggiornaListaTransazioni(meseSelezionato);
    aggiornaRiepilogoMensile(); // Mostra solo il riepilogo del mese selezionato
}

// Funzione per aggiornare la lista delle transazioni con filtro mese
function aggiornaListaTransazioni(meseFiltro = null) {
    document.getElementById('listaTransazioni').innerHTML = '';
    transazioni.forEach((transazione, index) => {
        if (!meseFiltro || transazione.mese === meseFiltro) {
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
        }
    });
}

// Funzione per modificare una transazione
function modificaTransazione(index) {
    const nuovoImporto = prompt("Inserisci il nuovo importo:", transazioni[index].importo);
    if (nuovoImporto !== null && !isNaN(nuovoImporto) && nuovoImporto > 0) {
        transazioni[index].importo = parseFloat(nuovoImporto);
        const meseFiltro = document.getElementById('meseFiltro').value;
        aggiornaListaTransazioni(meseFiltro);
        aggiornaRiepiloghi();
        salvaTransazioni();
    }
}

// Funzione per cancellare una transazione
function cancellaTransazione(index) {
    transazioni.splice(index, 1); // Rimuove la transazione dall'array
    const meseFiltro = document.getElementById('meseFiltro').value;
    aggiornaListaTransazioni(meseFiltro);
    aggiornaRiepiloghi();
    salvaTransazioni();
}

// Salva le transazioni nel LocalStorage
function salvaTransazioni() {
    localStorage.setItem('transazioni', JSON.stringify(transazioni));
}

// Carica le transazioni dal LocalStorage
function caricaDati() {
    const transazioniSalvate = localStorage.getItem('transazioni');
    if (transazioniSalvate) {
        transazioni = JSON.parse(transazioniSalvate);
        aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
        aggiornaRiepiloghi();
    }
}

// Inizializza la data corrente e aggiorna i riepiloghi al caricamento della pagina
window.onload = function() {
    caricaDati();
    impostaDataCorrente();
// Riferimento alla posizione nel database
const transazioniRef = firebase.database().ref('transazioni');

// Aggiunge una transazione al database Firebase
function aggiungiTransazione(persona, tipo, categoria, descrizione, importo, data) {
  const transazione = {
    persona,
    tipo,
    categoria,
    descrizione,
    importo: parseFloat(importo),
    data,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };
  transazioniRef.push(transazione);
}

// Ascolta i cambiamenti nel database e aggiorna la lista delle transazioni
transazioniRef.on('value', (snapshot) => {
  const transazioni = snapshot.val();
  const listaTransazioni = [];
  for (const id in transazioni) {
    listaTransazioni.push({ id, ...transazioni[id] });
  }
  aggiornaListaTransazioni(listaTransazioni);
});

function aggiornaListaTransazioni(transazioni) {
  document.getElementById('listaTransazioni').innerHTML = '';
  transazioni.forEach((transazione) => {
    const nuovaRiga = `
      <tr>
        <td>${transazione.persona}</td>
        <td>${transazione.tipo}</td>
        <td>${transazione.categoria}</td>
        <td>${transazione.descrizione}</td>
        <td>${transazione.data}</td>
        <td>€${transazione.importo.toFixed(2)}</td>
      </tr>
    `;
    document.getElementById('listaTransazioni').insertAdjacentHTML('beforeend', nuovaRiga);
  });
}
// Cancellare una transazione
function cancellaTransazione(id) {
  transazioniRef.child(id).remove();
}

// Modificare una transazione
function modificaTransazione(id, nuoviDati) {
  transazioniRef.child(id).update(nuoviDati);
}
};
