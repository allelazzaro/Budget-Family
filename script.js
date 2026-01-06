// ==============================
// FUNZIONI GLOBALI
// ==============================

// Restituisce lo stesso mese dell'anno precedente (formato "YYYY-MM")
function getStessoMeseAnnoPrecedente(annoMese) {
  const [year, month] = annoMese.split('-');
  const prevYear = parseInt(year) - 1;
  return `${prevYear}-${month}`;
}

// Calcola totali per un dato periodo (mese o anno); se "person" è specificato, filtra per quella persona.
function calcolaTotali(period, filterType = 'month', person = null) {
  let entrate = 0, uscite = 0;
  transazioni.forEach(([id, t]) => {
    if (filterType === 'month' && t.data.slice(0, 7) === period) {
      if (person && t.persona !== person) return;
      if (t.tipo === 'Entrata') entrate += parseFloat(t.importo);
      else if (t.tipo === 'Uscita') uscite += parseFloat(t.importo);
    } else if (filterType === 'year' && t.data.slice(0, 4) === period) {
      if (person && t.persona !== person) return;
      if (t.tipo === 'Entrata') entrate += parseFloat(t.importo);
      else if (t.tipo === 'Uscita') uscite += parseFloat(t.importo);
    }
  });
  return { entrate, uscite, saldo: entrate - uscite };
}

// Funzioni helper per il formatting delle differenze
function getDifferenzaClass(valore) {
  if (valore > 0) return 'differenza-positiva';
  if (valore < 0) return 'differenza-negativa';
  return 'differenza-neutra';
}

function formatDifferenza(valore) {
  const assoluto = Math.abs(valore);
  return `€${assoluto.toFixed(2)}`;
}

// ==============================
// FUNZIONI HELPER PER ULTIMA SPESA
// ==============================

/**
 * Formatta la data in formato italiano DD/MM/YYYY
 */
function formattaDataItaliana(dataISO) {
  if (!dataISO) return 'N/D';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

/**
 * Mostra l'ultima spesa inserita nel box dedicato
 */
function mostraUltimaSpesa(spesa) {
  const boxContainer = document.getElementById('ultimaSpesaBox');
  const boxEmpty = document.getElementById('ultimaSpesaEmpty');
  const content = document.getElementById('ultimaSpesaContent');
  const badge = document.getElementById('badgeNuova');
  
  if (!boxContainer || !content) {
    console.warn('Box ultima spesa non trovato nell\'HTML');
    return;
  }
  
  // Nascondi stato vuoto e mostra il box
  if (boxEmpty) boxEmpty.style.display = 'none';
  boxContainer.style.display = 'block';
  
  // Crea il contenuto HTML
  content.innerHTML = `
    <div class="spesa-field">
      <span class="spesa-label">Importo</span>
      <span class="spesa-value importo">€${parseFloat(spesa.importo).toFixed(2)}</span>
    </div>
    
    <div class="spesa-field">
      <span class="spesa-label">Categoria</span>
      <span class="spesa-value categoria">${spesa.categoria || 'N/D'}</span>
    </div>
    
    <div class="spesa-field">
      <span class="spesa-label">Descrizione</span>
      <span class="spesa-value descrizione">${spesa.descrizione || 'Nessuna descrizione'}</span>
    </div>
    
    <div class="spesa-field">
      <span class="spesa-label">Data</span>
      <span class="spesa-value data">${formattaDataItaliana(spesa.data)}</span>
    </div>
  `;
  
  // Mostra badge "NUOVA" temporaneamente
  if (badge) {
    badge.style.display = 'block';
    setTimeout(() => {
      badge.style.display = 'none';
    }, 3000);
  }
  
  // Aggiungi animazione di aggiornamento
  boxContainer.classList.add('aggiornata');
  setTimeout(() => {
    boxContainer.classList.remove('aggiornata');
  }, 600);
  
  // Salva in localStorage
  salvUltimaSpesaLocalStorage(spesa);
}

/**
 * Salva l'ultima spesa nel localStorage
 */
function salvUltimaSpesaLocalStorage(spesa) {
  try {
    localStorage.setItem('ultimaSpesaInserita', JSON.stringify(spesa));
  } catch (e) {
    console.warn('Impossibile salvare in localStorage:', e);
  }
}

/**
 * Carica l'ultima spesa dal localStorage all'avvio
 */
function caricaUltimaSpesaLocalStorage() {
  try {
    const spesaSalvata = localStorage.getItem('ultimaSpesaInserita');
    if (spesaSalvata) {
      const spesa = JSON.parse(spesaSalvata);
      mostraUltimaSpesa(spesa);
    }
  } catch (e) {
    console.warn('Impossibile caricare da localStorage:', e);
  }
}

/**
 * Cancella l'ultima spesa dal localStorage e nasconde il box
 */
window.cancellaUltimaSpesa = function() {
  if (confirm('Vuoi cancellare l\'ultima spesa visualizzata?')) {
    // Rimuove dal localStorage
    localStorage.removeItem('ultimaSpesaInserita');
    
    // Nasconde il box
    const box = document.getElementById('ultimaSpesaBox');
    const emptyBox = document.getElementById('ultimaSpesaEmpty');
    
    if (box) {
      box.style.display = 'none';
    }
    
    if (emptyBox) {
      emptyBox.style.display = 'flex';
    }
    
    console.log('Ultima spesa cancellata dal localStorage');
  }
};


// ==============================
// FUNZIONE MIGLIORATA PER LE DIFFERENZE
// ==============================
function calcolaDifferenze() {
  const meseFiltro = document.getElementById('meseFiltro').value;
  if (!meseFiltro) return;
  
  // --- Confronto Mensile ---
  const meseConfronto = getStessoMeseAnnoPrecedente(meseFiltro);
  const totaliMeseCorrente = calcolaTotali(meseFiltro, 'month');
  const totaliMesePrecedente = calcolaTotali(meseConfronto, 'month');
  
  const diffMeseTotale = {
    entrate: totaliMeseCorrente.entrate - totaliMesePrecedente.entrate,
    uscite: totaliMeseCorrente.uscite - totaliMesePrecedente.uscite,
    saldo: totaliMeseCorrente.saldo - totaliMesePrecedente.saldo
  };
  
  const totaliMeseCorrenteAlessio = calcolaTotali(meseFiltro, 'month', 'Alessio');
  const totaliMesePrecedenteAlessio = calcolaTotali(meseConfronto, 'month', 'Alessio');
  
  const diffMeseAlessio = {
    entrate: totaliMeseCorrenteAlessio.entrate - totaliMesePrecedenteAlessio.entrate,
    uscite: totaliMeseCorrenteAlessio.uscite - totaliMesePrecedenteAlessio.uscite,
    saldo: totaliMeseCorrenteAlessio.saldo - totaliMesePrecedenteAlessio.saldo
  };

  // Formatta le date per il confronto
  const [annoCorrente, meseNumCorrente] = meseFiltro.split('-');
  const [annoPrecedente, meseNumPrecedente] = meseConfronto.split('-');
  const nomiMesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const meseNomeCorrente = nomiMesi[parseInt(meseNumCorrente) - 1];
  const meseNomePrecedente = nomiMesi[parseInt(meseNumPrecedente) - 1];

  const htmlMese = `
    <div onclick="apriDettaglioDiff('meseTotal')" style="cursor:pointer;">
      <h3>📅 Confronto Mensile Totale</h3>
      
      <div class="metric-container">
        <div class="metric-row">
          <span class="metric-label">💰 Entrate</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrente.entrate.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedente.entrate.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffMeseTotale.entrate)}">
              ${formatDifferenza(diffMeseTotale.entrate)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">💸 Uscite</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrente.uscite.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedente.uscite.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(-diffMeseTotale.uscite)}">
              ${formatDifferenza(diffMeseTotale.uscite)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">📊 Saldo</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrente.saldo.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedente.saldo.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffMeseTotale.saldo)}">
              ${formatDifferenza(diffMeseTotale.saldo)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="periodo-confronto">
        Confronto: ${meseNomeCorrente} ${annoCorrente} vs ${meseNomePrecedente} ${annoPrecedente}
      </div>
    </div>
    
    <div onclick="apriDettaglioDiff('meseAlessio')" style="cursor:pointer;">
      <h4>👤 Alessio (Mese)</h4>
      
      <div class="metric-container">
        <div class="metric-row">
          <span class="metric-label">💰 Entrate</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrenteAlessio.entrate.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedenteAlessio.entrate.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffMeseAlessio.entrate)}">
              ${formatDifferenza(diffMeseAlessio.entrate)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">💸 Uscite</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrenteAlessio.uscite.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedenteAlessio.uscite.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(-diffMeseAlessio.uscite)}">
              ${formatDifferenza(diffMeseAlessio.uscite)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">📊 Saldo</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliMeseCorrenteAlessio.saldo.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliMesePrecedenteAlessio.saldo.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffMeseAlessio.saldo)}">
              ${formatDifferenza(diffMeseAlessio.saldo)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="periodo-confronto">
        Confronto: ${meseNomeCorrente} ${annoCorrente} vs ${meseNomePrecedente} ${annoPrecedente}
      </div>
    </div>
  `;

  // --- Confronto Annuale ---
  const annoSelezionato = meseFiltro.slice(0, 4);
  const annoConfronto = (parseInt(annoSelezionato) - 1).toString();
  const totaliAnnoCorrente = calcolaTotali(annoSelezionato, 'year');
  const totaliAnnoPrecedente = calcolaTotali(annoConfronto, 'year');
  
  const diffAnnoTotale = {
    entrate: totaliAnnoCorrente.entrate - totaliAnnoPrecedente.entrate,
    uscite: totaliAnnoCorrente.uscite - totaliAnnoPrecedente.uscite,
    saldo: totaliAnnoCorrente.saldo - totaliAnnoPrecedente.saldo
  };

  const totaliAnnoCorrenteAlessio = calcolaTotali(annoSelezionato, 'year', 'Alessio');
  const totaliAnnoPrecedenteAlessio = calcolaTotali(annoConfronto, 'year', 'Alessio');
  
  const diffAnnoAlessio = {
    entrate: totaliAnnoCorrenteAlessio.entrate - totaliAnnoPrecedenteAlessio.entrate,
    uscite: totaliAnnoCorrenteAlessio.uscite - totaliAnnoPrecedenteAlessio.uscite,
    saldo: totaliAnnoCorrenteAlessio.saldo - totaliAnnoPrecedenteAlessio.saldo
  };

  const htmlAnno = `
    <div onclick="apriDettaglioDiff('annoTotal')" style="cursor:pointer;">
      <h3>📆 Confronto Annuale Totale</h3>
      
      <div class="metric-container">
        <div class="metric-row">
          <span class="metric-label">💰 Entrate</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrente.entrate.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedente.entrate.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffAnnoTotale.entrate)}">
              ${formatDifferenza(diffAnnoTotale.entrate)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">💸 Uscite</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrente.uscite.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedente.uscite.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(-diffAnnoTotale.uscite)}">
              ${formatDifferenza(diffAnnoTotale.uscite)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">📊 Saldo</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrente.saldo.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedente.saldo.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffAnnoTotale.saldo)}">
              ${formatDifferenza(diffAnnoTotale.saldo)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="periodo-confronto">
        Confronto: Anno ${annoSelezionato} vs Anno ${annoConfronto}
      </div>
    </div>
    
    <div onclick="apriDettaglioDiff('annoAlessio')" style="cursor:pointer;">
      <h4>👤 Alessio (Anno)</h4>
      
      <div class="metric-container">
        <div class="metric-row">
          <span class="metric-label">💰 Entrate</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrenteAlessio.entrate.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedenteAlessio.entrate.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffAnnoAlessio.entrate)}">
              ${formatDifferenza(diffAnnoAlessio.entrate)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">💸 Uscite</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrenteAlessio.uscite.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedenteAlessio.uscite.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(-diffAnnoAlessio.uscite)}">
              ${formatDifferenza(diffAnnoAlessio.uscite)}
            </span>
          </div>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">📊 Saldo</span>
          <div class="metric-values">
            <span class="metric-current">€${totaliAnnoCorrenteAlessio.saldo.toFixed(2)}</span>
            <span class="metric-arrow">←</span>
            <span class="metric-previous">€${totaliAnnoPrecedenteAlessio.saldo.toFixed(2)}</span>
            <span class="metric-diff ${getDifferenzaClass(diffAnnoAlessio.saldo)}">
              ${formatDifferenza(diffAnnoAlessio.saldo)}
            </span>
          </div>
        </div>
      </div>
      
      <div class="periodo-confronto">
        Confronto: Anno ${annoSelezionato} vs Anno ${annoConfronto}
      </div>
    </div>
  `;

  document.getElementById('differenzeMese').innerHTML = htmlMese;
  document.getElementById('differenzeAnno').innerHTML = htmlAnno;
}

// -----------------------------
// FINE FUNZIONI PER IL CONFRONTO DEI DATI
// -----------------------------

// -----------------------------
// IMPORTA MODULI FIREBASE
// -----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyChK3rrqQ8hYygNLaahaxgtx8W1oUpxBP0",
  authDomain: "budget-a41a6.firebaseapp.com",
  databaseURL: "https://budget-a41a6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "budget-a41a6",
  storageBucket: "budget-a41a6.appspot.com",
  messagingSenderId: "1044297998779",
  appId: "1:1044297998779:web:3848d0c0c2b9840b66249e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let utente = null;
let transazioni = [];
let categorie = []; // Array delle categorie caricate da Firebase

// Categorie fisse (non eliminabili, solo modificabili)
const categorieDefault = [
  "CONDOMINIO", "ALIMENTARI", "COSE DI CASA", "ANIMALI", "LUCE E IMPOSTE",
  "INTERNET + CELLULARE", "VARIE", "SPORT", "CULTURA", "SALUTE", "BELLEZZA",
  "ABBIGLIAMENTO", "RATA AUTO", "CONSUMI", "MANUTENZIONE", "AUTOSTRADA/PARCHEGGI/MULTE",
  "ASSICURAZIONE", "BOLLI TAGLIANDI", "COLAZIONI", "PRANZI", "MERENDE",
  "APE DOPO CENA", "CENE INSIEME", "SERATE CON AMICI", "VACANZE", "REGALI", "ELETTRONICA"
];

window.registrati = function () {
  const email = document.getElementById('emailRegistrazione').value;
  const password = document.getElementById('passwordRegistrazione').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Registrazione completata con successo! Ora accedi.");
    })
    .catch(error => alert("Errore durante la registrazione: " + error.message));
};

window.accedi = function () {
  const email = document.getElementById('emailLogin').value;
  const password = document.getElementById('passwordLogin').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('appContainer').style.display = 'block';
    })
    .catch(error => alert("Errore durante l'accesso: " + error.message));
};

window.esci = function () {
  signOut(auth)
    .then(() => {
      document.getElementById('loginContainer').style.display = 'block';
      document.getElementById('appContainer').style.display = 'none';
      localStorage.removeItem('nomeUtente');
    })
    .catch(error => alert("Errore durante il logout: " + error.message));
};

onAuthStateChanged(auth, user => {
  if (user) {
    utente = user;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    caricaCategorie(); // Carica prima le categorie
    caricaTransazioni();
  } else {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('appContainer').style.display = 'none';
  }
});

function impostaDataCorrente() {
  const oggi = new Date().toISOString().split('T')[0];
  const entrataData = document.getElementById('dataEntrata');
  const uscitaData = document.getElementById('dataUscita');
  const meseFiltro = document.getElementById('meseFiltro');
  if (entrataData) entrataData.value = oggi;
  if (uscitaData) uscitaData.value = oggi;
  if (meseFiltro && !meseFiltro.value) meseFiltro.value = oggi.slice(0, 7);
}

function aggiornaNomeUtente(nome) {
  const personaEntrata = document.getElementById('personaEntrata');
  const personaUscita = document.getElementById('personaUscita');
  if (personaEntrata) personaEntrata.value = nome;
  if (personaUscita) personaUscita.value = nome;
}

window.aggiungiEntrata = function () {
  const persona = document.getElementById('personaEntrata').value;
  const tipo = document.getElementById('tipoEntrata').value;
  let importo = document.getElementById('importoEntrata').value;
  const data = document.getElementById('dataEntrata').value;
  if (!importo || !data) {
    alert("Compila tutti i campi!");
    return;
  }
  
  // Converti virgola in punto per supportare formato italiano
  importo = importo.replace(',', '.');
  
  const nuovaTransazione = {
    tipo: "Entrata",
    persona: persona,
    categoria: tipo,
    importo: parseFloat(importo),
    data: data
  };
  push(ref(db, 'transazioni'), nuovaTransazione);
  document.getElementById('importoEntrata').value = '';
};

window.aggiungiUscita = function () {
  const persona = document.getElementById('personaUscita').value;
  const categoria = document.getElementById('categoriaUscita').value;
  const descrizione = document.getElementById('descrizioneUscita').value;
  let importo = document.getElementById('importoUscita').value;
  const data = document.getElementById('dataUscita').value;
  
  // Validazione
  if (!importo || !data) {
    alert("Compila tutti i campi obbligatori!");
    return;
  }
  
  // Converti virgola in punto per supportare formato italiano
  importo = importo.replace(',', '.');
  
  // Crea l'oggetto transazione
  const nuovaTransazione = {
    tipo: "Uscita",
    persona: persona,
    categoria: categoria,
    descrizione: descrizione,
    importo: parseFloat(importo),
    data: data
  };
  
  // Salva su Firebase
  push(ref(db, 'transazioni'), nuovaTransazione);
  
  // ✅ MOSTRA L'ULTIMA SPESA INSERITA
  mostraUltimaSpesa(nuovaTransazione);
  
  // Reset del form
  document.getElementById('descrizioneUscita').value = '';
  document.getElementById('importoUscita').value = '';
};

function caricaTransazioni() {
  onValue(ref(db, 'transazioni'), snapshot => {
    const dati = snapshot.val();
    transazioni = dati ? Object.entries(dati) : [];
    aggiornaTabella();
    aggiornaRiepiloghi();
    if (document.getElementById('meseFiltro').value) calcolaDifferenze();
  });
}

function aggiornaTabella() {
  const tbody = document.getElementById('listaTransazioni');
  tbody.innerHTML = '';
  transazioni
    .sort((a, b) => new Date(b[1].data) - new Date(a[1].data))
    .forEach(([id, t]) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = t.persona || '';
      row.insertCell(1).innerText = t.categoria || '';
      row.insertCell(2).innerText = t.descrizione || '';
      row.insertCell(3).innerText = t.data || '';
      row.insertCell(4).innerText = `€${parseFloat(t.importo).toFixed(2)}`;
      const cellAzioni = row.insertCell(5);
      const btnElimina = document.createElement('button');
      btnElimina.innerText = 'Elimina';
      btnElimina.className = 'btn-azione';
      btnElimina.onclick = () => eliminaTransazione(id);
      cellAzioni.appendChild(btnElimina);
      const btnModifica = document.createElement('button');
      btnModifica.innerText = 'Modifica';
      btnModifica.className = 'btn-azione';
      btnModifica.onclick = () => modificaTransazione(id, t);
      cellAzioni.appendChild(btnModifica);
    });
  
  // Aggiorna riepilogo giornaliero
  if (typeof aggiornaRiepilogoGiornaliero === 'function') {
    aggiornaRiepilogoGiornaliero();
  }
}

window.eliminaTransazione = function (id) {
  if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
    remove(ref(db, 'transazioni/' + id));
  }
};

window.modificaTransazione = function (id, transazione) {
  const nuovoImporto = prompt("Nuovo importo:", transazione.importo);
  const nuovaDescrizione = prompt("Nuova descrizione:", transazione.descrizione || "");
  if (nuovoImporto !== null) {
    update(ref(db, 'transazioni/' + id), {
      importo: parseFloat(nuovoImporto),
      descrizione: nuovaDescrizione || transazione.descrizione
    });
  }
};

function aggiornaRiepiloghi() {
  const meseFiltro = document.getElementById('meseFiltro').value;
  const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();

  let entrateAnno = 0, usciteAnno = 0;
  let entrateMese = 0, usciteMese = 0;
  let entrateAlessio = 0, usciteAlessio = 0;

  transazioni.forEach(([id, t]) => {
    const importo = parseFloat(t.importo);
    const anno = t.data.slice(0, 4);
    const mese = t.data.slice(0, 7);

    if (anno === annoSelezionato) {
      if (t.tipo === 'Entrata') entrateAnno += importo;
      if (t.tipo === 'Uscita') usciteAnno += importo;
    }

    if (mese === meseFiltro) {
      if (t.tipo === 'Entrata') entrateMese += importo;
      if (t.tipo === 'Uscita') usciteMese += importo;
    }

    if (anno === annoSelezionato && t.persona === 'Alessio') {
      if (t.tipo === 'Entrata') entrateAlessio += importo;
      if (t.tipo === 'Uscita') usciteAlessio += importo;
    }
  });

  const saldoAnno = entrateAnno - usciteAnno;
  const saldoMese = entrateMese - usciteMese;
  const saldoAlessio = entrateAlessio - usciteAlessio;

  document.getElementById('riepilogoEntrate').innerText = `€${entrateAnno.toFixed(2)}`;
  document.getElementById('riepilogoUscite').innerText = `€${usciteAnno.toFixed(2)}`;
  document.getElementById('riepilogoSaldo').innerText = `€${saldoAnno.toFixed(2)}`;

  document.getElementById('riepilogoMese').innerHTML = `
    <div class="summary-item">
      <span class="summary-label">Entrate:</span>
      <span class="summary-value income">€${entrateMese.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Uscite:</span>
      <span class="summary-value expense">€${usciteMese.toFixed(2)}</span>
    </div>
    <div class="summary-item total">
      <span class="summary-label">Saldo:</span>
      <span class="summary-value">€${saldoMese.toFixed(2)}</span>
    </div>
  `;

  document.getElementById('riepilogoAlessioEntrate').innerText = `€${entrateAlessio.toFixed(2)}`;
  document.getElementById('riepilogoAlessioUscite').innerText = `€${usciteAlessio.toFixed(2)}`;
  document.getElementById('riepilogoAlessioSaldo').innerText = `€${saldoAlessio.toFixed(2)}`;
}

function aggiornaListaTransazioni(meseFiltro) {
  const tbody = document.getElementById('listaTransazioni');
  tbody.innerHTML = '';
  transazioni
    .filter(([id, t]) => !meseFiltro || t.data.slice(0, 7) === meseFiltro)
    .sort((a, b) => new Date(b[1].data) - new Date(a[1].data))
    .forEach(([id, t]) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = t.persona || '';
      row.insertCell(1).innerText = t.categoria || '';
      row.insertCell(2).innerText = t.descrizione || '';
      row.insertCell(3).innerText = t.data || '';
      row.insertCell(4).innerText = `€${parseFloat(t.importo).toFixed(2)}`;
      const cellAzioni = row.insertCell(5);
      const btnElimina = document.createElement('button');
      btnElimina.innerText = 'Elimina';
      btnElimina.className = 'btn-azione';
      btnElimina.onclick = () => eliminaTransazione(id);
      cellAzioni.appendChild(btnElimina);
      const btnModifica = document.createElement('button');
      btnModifica.innerText = 'Modifica';
      btnModifica.className = 'btn-azione';
      btnModifica.onclick = () => modificaTransazione(id, t);
      cellAzioni.appendChild(btnModifica);
    });
}


document.getElementById('meseFiltro').addEventListener('change', function () {
  const mese = this.value;
  localStorage.setItem('meseFiltro', mese);
  aggiornaRiepiloghi();
  calcolaDifferenze();
  if (transazioniVisibili) {
    aggiornaListaTransazioni(mese);
  }
});

let transazioniVisibili = false;
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

window.esportaInExcel = async function () {
  const meseFiltro = document.getElementById('meseFiltro').value;
  const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();
  const datiRiepilogo = {};
  transazioni
    .filter(([_, t]) => t.tipo === "Uscita" && t.data.slice(0, 4) === annoSelezionato)
    .forEach(([id, t]) => {
      const { persona, categoria, importo, data } = t;
      const mese = new Date(data).toLocaleString("it-IT", { month: "long" });
      if (!datiRiepilogo[mese]) datiRiepilogo[mese] = {};
      if (!datiRiepilogo[mese][categoria]) datiRiepilogo[mese][categoria] = { Alessio: 0 };
      datiRiepilogo[mese][categoria][persona] += parseFloat(importo) || 0;
    });
  const categorieTotali = [];
  Object.keys(datiRiepilogo).forEach(mese => {
    Object.entries(datiRiepilogo[mese]).forEach(([categoria, persone]) => {
      const totaleCategoria = Object.values(persone).reduce((sum, val) => sum + val, 0);
      const existing = categorieTotali.find(c => c.categoria === categoria);
      if (existing) {
        existing.totale += totaleCategoria;
      } else {
        categorieTotali.push({ categoria, totale: totaleCategoria });
      }
    });
  });
  categorieTotali.sort((a, b) => b.totale - a.totale);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Riepilogo ${annoSelezionato}`);
  const mesi = Object.keys(datiRiepilogo);
  const headerRow = ["Categoria", ...mesi.map(mese => `${mese} Alessio`), "Totale Categoria"];
  worksheet.addRow(headerRow);
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "007BFF" } };
    cell.alignment = { horizontal: "center" };
  });
  const totalColumns = new Array(mesi.length).fill(0);
  let totaleGenerale = 0;
  categorieTotali.forEach(({ categoria }) => {
    const row = [categoria];
    let totaleRiga = 0;
    mesi.forEach((mese, idx) => {
      const alessioValue = datiRiepilogo[mese][categoria]?.Alessio || 0;
      row.push(alessioValue);
      totalColumns[idx] += alessioValue;
      totaleRiga += alessioValue;
    });
    row.push(totaleRiga);
    totaleGenerale += totaleRiga;
    worksheet.addRow(row);
  });
  const totaliRow = ["Totale"];
  totalColumns.forEach(total => totaliRow.push(total));
  totaliRow.push(totaleGenerale);
  const totaleRowRef = worksheet.addRow(totaliRow);
  totaleRowRef.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFA500" } };
    cell.alignment = { horizontal: "center" };
  });
  mesi.forEach((mese, idx) => {
    const colAlessio = 2 + idx;
    worksheet.getColumn(colAlessio).eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && rowNumber !== totaleRowRef.number) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "ADD8E6" } };
      }
    });
  });
  worksheet.getColumn(headerRow.length).eachCell((cell, rowNumber) => {
    if (rowNumber > 1 && rowNumber !== totaleRowRef.number) {
      cell.font = { bold: true };
    }
  });
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      if (cell.value) {
        const valueLength = cell.value.toString().length;
        if (valueLength > maxLength) maxLength = valueLength;
      }
    });
    column.width = maxLength + 2;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `RiepilogoSpese_${annoSelezionato}.xlsx`);
};

window.salvaNomeUtente = function () {
  const nomeUtente = document.getElementById('userName').value.trim();
  if (nomeUtente) {
    localStorage.setItem('nomeUtente', nomeUtente);
    document.getElementById('personaEntrata').value = nomeUtente;
    document.getElementById('personaUscita').value = nomeUtente;
    document.getElementById('welcomeMessage').innerText = `Ciao, ${nomeUtente}!`;
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
  } else {
    alert("Inserisci un nome valido.");
  }
};

window.vaiAllaPaginaDettagli = function (persona, tipo) {
  const url = `dettagli.html?persona=${encodeURIComponent(persona)}&tipo=${encodeURIComponent(tipo)}`;
  console.log("Navigazione verso:", url);
  window.location.href = url;
};

// ==============================
// GESTIONE CATEGORIE
// ==============================

// Carica le categorie da Firebase
function caricaCategorie() {
  // Prima popola subito con le categorie di default (fallback immediato)
  if (categorie.length === 0) {
    categorie = categorieDefault.map((nome, index) => ({
      id: `default_${index}`,
      nome: nome,
      fissa: true
    }));
    popolaSelectCategorie();
  }
  
  const categorieRef = ref(db, 'categorie');
  onValue(categorieRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Converte l'oggetto in array e ordina alfabeticamente
      categorie = Object.entries(data).map(([id, cat]) => ({
        id,
        nome: cat.nome,
        fissa: cat.fissa || false // Flag per categorie fisse
      })).sort((a, b) => a.nome.localeCompare(b.nome));
      popolaSelectCategorie();
      aggiornaListaCategorie();
    } else {
      // Se non ci sono categorie su Firebase, inizializza con quelle di default
      inizializzaCategorieDefault();
    }
  }, (error) => {
    console.error("Errore caricamento categorie:", error);
    // In caso di errore, usa le categorie di default locali
    if (categorie.length === 0) {
      categorie = categorieDefault.map((nome, index) => ({
        id: `default_${index}`,
        nome: nome,
        fissa: true
      }));
      popolaSelectCategorie();
    }
  });
}

// Inizializza le categorie di default su Firebase (come fisse)
function inizializzaCategorieDefault() {
  categorieDefault.forEach(cat => {
    const nuovaRef = push(ref(db, 'categorie'));
    set(nuovaRef, { nome: cat, fissa: true }); // fissa: true per le categorie di default
  });
}

// Popola il select delle categorie dinamicamente
function popolaSelectCategorie() {
  const select = document.getElementById('categoriaUscita');
  if (!select) return;
  
  // Salva la selezione corrente
  const selezioneCorrente = select.value;
  
  // Svuota il select
  select.innerHTML = '';
  
  // Aggiungi le categorie ordinate
  categorie.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.nome;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
  
  // Ripristina la selezione se esiste ancora
  if (selezioneCorrente && categorie.find(c => c.nome === selezioneCorrente)) {
    select.value = selezioneCorrente;
  }
}

// Aggiorna la lista delle categorie nella modale
function aggiornaListaCategorie() {
  const lista = document.getElementById('listaCategorieModal');
  const contatore = document.getElementById('contatoreCat');
  if (!lista) return;
  
  // Conta categorie fisse e personalizzate
  const numFisse = categorie.filter(c => c.fissa).length;
  const numPersonalizzate = categorie.filter(c => !c.fissa).length;
  
  // Aggiorna contatore
  if (contatore) {
    contatore.textContent = `${categorie.length} totali (${numFisse} fisse, ${numPersonalizzate} personalizzate)`;
  }
  
  if (categorie.length === 0) {
    lista.innerHTML = '<div class="empty-categorie">Nessuna categoria presente</div>';
    return;
  }
  
  lista.innerHTML = categorie.map(cat => `
    <div class="categoria-item ${cat.fissa ? 'categoria-fissa' : 'categoria-personalizzata'}" data-id="${cat.id}">
      <span class="categoria-nome">
        ${cat.fissa ? '🔒' : '🏷️'} ${cat.nome}
      </span>
      <div class="categoria-actions">
        <button onclick="modificaCategoria('${cat.id}', '${cat.nome}')" class="btn-edit" title="Modifica">✏️</button>
        ${cat.fissa ? '' : `<button onclick="eliminaCategoria('${cat.id}', '${cat.nome}')" class="btn-delete" title="Elimina">🗑️</button>`}
      </div>
    </div>
  `).join('');
}

// Apri modale gestione categorie
window.apriGestioneCategorie = function() {
  const modal = document.getElementById('modalCategorie');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('nuovaCategoria').value = '';
    document.getElementById('btnAggiungiCategoria').textContent = 'Aggiungi';
    document.getElementById('btnAggiungiCategoria').onclick = aggiungiCategoria;
    delete document.getElementById('btnAggiungiCategoria').dataset.editId;
  }
};

// Chiudi modale gestione categorie
window.chiudiGestioneCategorie = function() {
  const modal = document.getElementById('modalCategorie');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Aggiungi nuova categoria (sempre come personalizzata)
window.aggiungiCategoria = function() {
  const input = document.getElementById('nuovaCategoria');
  const nome = input.value.trim().toUpperCase();
  const btn = document.getElementById('btnAggiungiCategoria');
  const editId = btn.dataset.editId;
  
  if (!nome) {
    alert('Inserisci un nome per la categoria');
    return;
  }
  
  // Controlla se esiste già (escludendo quella in modifica)
  const esistente = categorie.find(c => c.nome === nome && c.id !== editId);
  if (esistente) {
    alert('Questa categoria esiste già');
    return;
  }
  
  if (editId) {
    // Modalità modifica - mantiene il flag fissa originale
    const categoriaOriginale = categorie.find(c => c.id === editId);
    const categoriaRef = ref(db, `categorie/${editId}`);
    update(categoriaRef, { nome: nome })
      .then(() => {
        input.value = '';
        btn.textContent = 'Aggiungi';
        delete btn.dataset.editId;
      })
      .catch(err => alert('Errore durante la modifica: ' + err.message));
  } else {
    // Modalità aggiunta - sempre come personalizzata (fissa: false)
    const nuovaRef = push(ref(db, 'categorie'));
    set(nuovaRef, { nome: nome, fissa: false })
      .then(() => {
        input.value = '';
      })
      .catch(err => alert('Errore durante il salvataggio: ' + err.message));
  }
};

// Modifica categoria esistente
window.modificaCategoria = function(id, nomeAttuale) {
  const input = document.getElementById('nuovaCategoria');
  const btn = document.getElementById('btnAggiungiCategoria');
  
  input.value = nomeAttuale;
  input.focus();
  btn.textContent = 'Salva Modifica';
  btn.dataset.editId = id;
};

// Elimina categoria (solo per quelle personalizzate)
window.eliminaCategoria = function(id, nome) {
  // Verifica che non sia una categoria fissa
  const categoria = categorie.find(c => c.id === id);
  if (categoria && categoria.fissa) {
    alert('Le categorie fisse non possono essere eliminate, solo modificate.');
    return;
  }
  
  if (!confirm(`Sei sicuro di voler eliminare la categoria "${nome}"?\n\nNota: Le transazioni già registrate con questa categoria non verranno modificate.`)) {
    return;
  }
  
  const categoriaRef = ref(db, `categorie/${id}`);
  remove(categoriaRef)
    .catch(err => alert('Errore durante l\'eliminazione: ' + err.message));
};

// Chiudi modale cliccando fuori
window.onclick = function(event) {
  const modal = document.getElementById('modalCategorie');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

window.onload = function () {
  impostaDataCorrente();
  const nomeUtente = localStorage.getItem('nomeUtente');
  if (nomeUtente) {
    aggiornaNomeUtente(nomeUtente);
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
  } else {
    document.getElementById('loginContainer').style.display = 'block';
  }
};

// Funzioni globali per il window
window.registrati = registrati;
window.accedi = accedi;
window.salvaNomeUtente = salvaNomeUtente;

// AUTO-LOAD DIFFERENZE SU MOBILE
document.addEventListener('DOMContentLoaded', () => {
  const filtro = document.getElementById('meseFiltro');
  if (filtro && filtro.value) calcolaDifferenze();
  const diffSection = document.getElementById('differenze');
  if (diffSection) diffSection.addEventListener('click', calcolaDifferenze);
  
  // ✅ Carica l'ultima spesa dal localStorage
  caricaUltimaSpesaLocalStorage();
  
  // ✅ Inizializza riepilogo giornaliero
  if (typeof inizializzaRiepilogoGiornaliero === 'function') {
    inizializzaRiepilogoGiornaliero();
  }
});/* =====================================================
   FUNZIONI SPESE RICORRENTI + RICERCA AVANZATA
   Aggiungi queste funzioni nel tuo script.js
   ===================================================== */

// ==============================
// VARIABILI GLOBALI
// ==============================
let speseRicorrenti = [];
let filtriAttivi = false;

// ==============================
// SPESE RICORRENTI - Gestione Modale
// ==============================

/**
 * Apri modale spese ricorrenti
 */
window.apriModalRicorrenti = function() {
  const modal = document.getElementById('modalRicorrenti');
  if (modal) {
    modal.style.display = 'flex';
    caricaSpeseRicorrenti();
    popolaCategorieRicorrenza();
  }
};

/**
 * Chiudi modale spese ricorrenti
 */
window.chiudiModalRicorrenti = function() {
  const modal = document.getElementById('modalRicorrenti');
  if (modal) {
    modal.style.display = 'none';
    resetFormRicorrenza();
  }
};

/**
 * Reset form ricorrenza
 */
function resetFormRicorrenza() {
  document.getElementById('nomeRicorrenza').value = '';
  document.getElementById('importoRicorrenza').value = '';
  document.getElementById('giornoRicorrenza').value = '';
  document.getElementById('descrizioneRicorrenza').value = '';
  document.getElementById('btnAggiungiRicorrenza').textContent = '➕ Aggiungi Spesa Ricorrente';
  delete document.getElementById('btnAggiungiRicorrenza').dataset.editId;
}

/**
 * Popola select categorie nel form ricorrenza
 */
function popolaCategorieRicorrenza() {
  const select = document.getElementById('categoriaRicorrenza');
  if (!select) return;
  
  select.innerHTML = '';
  
  // Usa le categorie globali già caricate
  if (typeof categorie !== 'undefined' && categorie.length > 0) {
    categorie.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.nome;
      option.textContent = cat.nome;
      select.appendChild(option);
    });
  }
}

/**
 * Carica spese ricorrenti da Firebase
 */
function caricaSpeseRicorrenti() {
  const ricorrentiRef = ref(db, 'speseRicorrenti');
  
  onValue(ricorrentiRef, (snapshot) => {
    const dati = snapshot.val();
    speseRicorrenti = dati ? Object.entries(dati).map(([id, data]) => ({ id, ...data })) : [];
    aggiornaListaRicorrenze();
  }, (error) => {
    console.error("Errore caricamento ricorrenti:", error);
  });
}

/**
 * Aggiorna lista ricorrenze nella modale
 */
function aggiornaListaRicorrenze() {
  const lista = document.getElementById('listaRicorrenze');
  const contatore = document.getElementById('contatoreRicorrenze');
  
  if (!lista) return;
  
  // Aggiorna contatore
  if (contatore) {
    const attive = speseRicorrenti.filter(r => r.attiva !== false).length;
    contatore.textContent = `${attive}/${speseRicorrenti.length}`;
  }
  
  // Mostra empty state se vuoto
  if (speseRicorrenti.length === 0) {
    lista.innerHTML = `
      <div class="empty-ricorrenze">
        <div class="empty-ricorrenze-icon">🔄</div>
        <div class="empty-ricorrenze-text">Nessuna spesa ricorrente configurata</div>
        <div class="empty-ricorrenze-hint">Aggiungi le tue spese fisse mensili</div>
      </div>
    `;
    return;
  }
  
  // Ordina per nome
  const ricorrenzeOrdinate = [...speseRicorrenti].sort((a, b) => 
    a.nome.localeCompare(b.nome)
  );
  
  // Genera HTML
  lista.innerHTML = ricorrenzeOrdinate.map(ric => {
    const attiva = ric.attiva !== false;
    const iconaStato = attiva ? '✅' : '⏸️';
    const titleStato = attiva ? 'Disattiva' : 'Attiva';
    
    return `
      <div class="ricorrenza-item ${attiva ? '' : 'inattiva'}">
        <div class="ricorrenza-info">
          <div class="ricorrenza-nome">${ric.nome}</div>
          <div class="ricorrenza-dettagli">
            <span class="ricorrenza-importo">€${parseFloat(ric.importo).toFixed(2)}</span>
            <span>📁 ${ric.categoria}</span>
            <span>📅 Giorno ${ric.giorno}</span>
            ${ric.descrizione ? `<span>📝 ${ric.descrizione}</span>` : ''}
          </div>
        </div>
        <div class="ricorrenza-actions">
          <button class="btn-toggle" onclick="toggleRicorrenza('${ric.id}')" title="${titleStato}">
            ${iconaStato}
          </button>
          <button class="btn-edit" onclick="modificaRicorrenza('${ric.id}')" title="Modifica">✏️</button>
          <button class="btn-delete" onclick="eliminaRicorrenza('${ric.id}', '${ric.nome}')" title="Elimina">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Aggiungi nuova spesa ricorrente
 */
window.aggiungiRicorrenza = function() {
  const nome = document.getElementById('nomeRicorrenza').value.trim();
  const categoria = document.getElementById('categoriaRicorrenza').value;
  let importo = document.getElementById('importoRicorrenza').value;
  const giorno = document.getElementById('giornoRicorrenza').value;
  const persona = document.getElementById('personaRicorrenza').value;
  const descrizione = document.getElementById('descrizioneRicorrenza').value.trim();
  const btn = document.getElementById('btnAggiungiRicorrenza');
  const editId = btn.dataset.editId;
  
  // Validazione
  if (!nome || !categoria || !importo || !giorno) {
    alert('Compila tutti i campi obbligatori (*)');
    return;
  }
  
  if (giorno < 1 || giorno > 31) {
    alert('Il giorno deve essere tra 1 e 31');
    return;
  }
  
  // Converti virgola in punto per supportare formato italiano
  importo = importo.replace(',', '.');
  
  const ricorrenza = {
    nome: nome,
    categoria: categoria,
    importo: parseFloat(importo),
    giorno: parseInt(giorno),
    persona: persona,
    descrizione: descrizione,
    attiva: true,
    dataCreazione: Date.now()
  };
  
  if (editId) {
    // Modalità modifica
    const ricorrenzaRef = ref(db, `speseRicorrenti/${editId}`);
    update(ricorrenzaRef, ricorrenza)
      .then(() => {
        resetFormRicorrenza();
        alert('✅ Spesa ricorrente aggiornata!');
      })
      .catch(err => {
        console.error('Errore aggiornamento:', err);
        alert('❌ Errore durante l\'aggiornamento');
      });
  } else {
    // Modalità aggiunta
    const nuovaRef = push(ref(db, 'speseRicorrenti'));
    set(nuovaRef, ricorrenza)
      .then(() => {
        resetFormRicorrenza();
        alert('✅ Spesa ricorrente aggiunta!');
      })
      .catch(err => {
        console.error('Errore salvataggio:', err);
        alert('❌ Errore durante il salvataggio');
      });
  }
};

/**
 * Modifica spesa ricorrente
 */
window.modificaRicorrenza = function(id) {
  const ricorrenza = speseRicorrenti.find(r => r.id === id);
  if (!ricorrenza) return;
  
  // Popola il form
  document.getElementById('nomeRicorrenza').value = ricorrenza.nome;
  document.getElementById('categoriaRicorrenza').value = ricorrenza.categoria;
  document.getElementById('importoRicorrenza').value = ricorrenza.importo;
  document.getElementById('giornoRicorrenza').value = ricorrenza.giorno;
  document.getElementById('personaRicorrenza').value = ricorrenza.persona;
  document.getElementById('descrizioneRicorrenza').value = ricorrenza.descrizione || '';
  
  // Cambia il pulsante
  const btn = document.getElementById('btnAggiungiRicorrenza');
  btn.textContent = '💾 Salva Modifiche';
  btn.dataset.editId = id;
  
  // Scroll to top
  document.querySelector('.modal-ricorrenti-body').scrollTop = 0;
};

/**
 * Elimina spesa ricorrente
 */
window.eliminaRicorrenza = function(id, nome) {
  if (!confirm(`Vuoi eliminare la spesa ricorrente "${nome}"?`)) {
    return;
  }
  
  const ricorrenzaRef = ref(db, `speseRicorrenti/${id}`);
  remove(ricorrenzaRef)
    .then(() => {
      alert('✅ Spesa ricorrente eliminata!');
    })
    .catch(err => {
      console.error('Errore eliminazione:', err);
      alert('❌ Errore durante l\'eliminazione');
    });
};

/**
 * Toggle attiva/disattiva ricorrenza
 */
window.toggleRicorrenza = function(id) {
  const ricorrenza = speseRicorrenti.find(r => r.id === id);
  if (!ricorrenza) return;
  
  const nuovoStato = !(ricorrenza.attiva !== false);
  const ricorrenzaRef = ref(db, `speseRicorrenti/${id}`);
  
  update(ricorrenzaRef, { attiva: nuovoStato })
    .then(() => {
      const msg = nuovoStato ? 'attivata' : 'disattivata';
      console.log(`Ricorrenza ${msg}`);
    })
    .catch(err => {
      console.error('Errore toggle:', err);
    });
};

/**
 * Genera spese ricorrenti del mese corrente
 */
window.generaSpeseDelMese = function() {
  const oggi = new Date();
  const meseCorrente = oggi.toISOString().slice(0, 7); // YYYY-MM
  const annoCorrente = oggi.getFullYear();
  const meseNum = oggi.getMonth() + 1; // 1-12
  
  // Filtra solo ricorrenze attive
  const ricorrenteAttive = speseRicorrenti.filter(r => r.attiva !== false);
  
  if (ricorrenteAttive.length === 0) {
    alert('⚠️ Nessuna spesa ricorrente attiva da generare');
    return;
  }
  
  if (!confirm(`Vuoi generare ${ricorrenteAttive.length} spese ricorrenti per ${meseCorrente}?`)) {
    return;
  }
  
  let generate = 0;
  let errori = 0;
  
  ricorrenteAttive.forEach(ric => {
    // Determina la data corretta
    let giorno = ric.giorno;
    const ultimoGiorno = new Date(annoCorrente, meseNum, 0).getDate();
    
    // Se il giorno supera l'ultimo giorno del mese, usa l'ultimo giorno
    if (giorno > ultimoGiorno) {
      giorno = ultimoGiorno;
    }
    
    const data = `${annoCorrente}-${String(meseNum).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`;
    
    // Crea la transazione
    const nuovaTransazione = {
      tipo: 'Uscita',
      persona: ric.persona,
      categoria: ric.categoria,
      descrizione: ric.descrizione || `${ric.nome} (ricorrente)`,
      importo: ric.importo,
      data: data,
      ricorrente: true,
      ricorrenteId: ric.id,
      timestamp: Date.now()
    };
    
    // Salva su Firebase
    push(ref(db, 'transazioni'), nuovaTransazione)
      .then(() => {
        generate++;
        if (generate + errori === ricorrenteAttive.length) {
          mostraRisultatoGenerazione(generate, errori);
        }
      })
      .catch(err => {
        console.error('Errore generazione:', err);
        errori++;
        if (generate + errori === ricorrenteAttive.length) {
          mostraRisultatoGenerazione(generate, errori);
        }
      });
  });
};

/**
 * Mostra risultato generazione spese
 */
function mostraRisultatoGenerazione(generate, errori) {
  if (errori === 0) {
    alert(`✅ Generate ${generate} spese ricorrenti con successo!`);
    chiudiModalRicorrenti();
  } else {
    alert(`⚠️ Generate ${generate} spese, ${errori} errori`);
  }
}

// ==============================
// RICERCA AVANZATA
// ==============================

/**
 * Toggle espansione filtri ricerca
 */
window.toggleSearchFilters = function() {
  const section = document.getElementById('searchSection');
  const filters = document.getElementById('searchFilters');
  const actions = document.getElementById('searchActions');
  
  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    filters.style.display = 'grid';
    actions.style.display = 'flex';
  } else {
    section.classList.add('collapsed');
    filters.style.display = 'none';
    actions.style.display = 'none';
  }
};

/**
 * Popola select categorie nella ricerca
 */
function popolaCategorieRicerca() {
  const select = document.getElementById('searchCategoria');
  if (!select) return;
  
  // Mantieni l'opzione "Tutte"
  const optionTutte = select.querySelector('option[value=""]');
  select.innerHTML = '';
  if (optionTutte) select.appendChild(optionTutte);
  
  // Aggiungi categorie
  if (typeof categorie !== 'undefined' && categorie.length > 0) {
    categorie.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.nome;
      option.textContent = cat.nome;
      select.appendChild(option);
    });
  }
}

/**
 * Applica filtri di ricerca
 */
window.applicaFiltri = function() {
  const testo = document.getElementById('searchText').value.toLowerCase().trim();
  
  // Leggi importi e converti virgola in punto
  let importoMinValue = document.getElementById('searchImportoMin').value;
  let importoMaxValue = document.getElementById('searchImportoMax').value;
  
  if (importoMinValue) importoMinValue = importoMinValue.replace(',', '.');
  if (importoMaxValue) importoMaxValue = importoMaxValue.replace(',', '.');
  
  const importoMin = parseFloat(importoMinValue) || 0;
  const importoMax = parseFloat(importoMaxValue) || Infinity;
  const dataDa = document.getElementById('searchDataDa').value;
  const dataA = document.getElementById('searchDataA').value;
  const tipo = document.getElementById('searchTipo').value;
  const categoria = document.getElementById('searchCategoria').value;
  const persona = document.getElementById('searchPersona').value;
  
  // Filtra transazioni
  const risultati = transazioni.filter(([id, t]) => {
    // Filtro testo
    if (testo) {
      const matchTesto = 
        (t.descrizione && t.descrizione.toLowerCase().includes(testo)) ||
        (t.categoria && t.categoria.toLowerCase().includes(testo));
      if (!matchTesto) return false;
    }
    
    // Filtro importo
    const importo = parseFloat(t.importo);
    if (importo < importoMin || importo > importoMax) return false;
    
    // Filtro data
    if (dataDa && t.data < dataDa) return false;
    if (dataA && t.data > dataA) return false;
    
    // Filtro tipo
    if (tipo && t.tipo !== tipo) return false;
    
    // Filtro categoria
    if (categoria && t.categoria !== categoria) return false;
    
    // Filtro persona
    if (persona && t.persona !== persona) return false;
    
    return true;
  });
  
  // Mostra risultati
  mostraRisultatiFiltrati(risultati);
  filtriAttivi = true;
};

/**
 * Mostra totali filtrati
 */
function mostraTotaliFiltrati(entrate, uscite, saldo) {
  const totalsDiv = document.getElementById('searchTotalsInfo');
  
  if (!totalsDiv) return;
  
  // Mostra il box totali
  totalsDiv.style.display = 'block';
  
  // Aggiorna entrate
  const entrateElement = document.getElementById('totalEntrateFiltered');
  if (entrateElement) {
    entrateElement.textContent = `€${entrate.toFixed(2)}`;
  }
  
  // Aggiorna uscite
  const usciteElement = document.getElementById('totalUsciteFiltered');
  if (usciteElement) {
    usciteElement.textContent = `€${uscite.toFixed(2)}`;
  }
  
  // Aggiorna saldo con classe appropriata
  const saldoElement = document.getElementById('totalSaldoFiltered');
  if (saldoElement) {
    const segno = saldo > 0 ? '+' : (saldo < 0 ? '-' : '');
    const importoAssoluto = Math.abs(saldo);
    saldoElement.textContent = `${segno}€${importoAssoluto.toFixed(2)}`;
    
    // Rimuovi classi precedenti
    saldoElement.classList.remove('positivo', 'negativo', 'zero');
    
    // Aggiungi classe appropriata
    if (saldo > 0) {
      saldoElement.classList.add('positivo');
    } else if (saldo < 0) {
      saldoElement.classList.add('negativo');
    } else {
      saldoElement.classList.add('zero');
    }
  }
}

/**
 * Mostra risultati filtrati nella tabella
 */
function mostraRisultatiFiltrati(risultati) {
  const tbody = document.getElementById('listaTransazioni');
  const infoDiv = document.getElementById('searchResultsInfo');
  const countSpan = document.getElementById('searchResultsCount');
  
  if (!tbody) return;
  
  // Aggiorna info risultati
  if (infoDiv && countSpan) {
    infoDiv.style.display = 'block';
    countSpan.textContent = risultati.length;
  }
  
  // Calcola totali filtrati
  let entrateTotal = 0;
  let usciteTotal = 0;
  
  risultati.forEach(([id, t]) => {
    const importo = parseFloat(t.importo) || 0;
    if (t.tipo === 'Entrata') {
      entrateTotal += importo;
    } else if (t.tipo === 'Uscita') {
      usciteTotal += importo;
    }
  });
  
  const saldo = entrateTotal - usciteTotal;
  
  // Mostra totali
  mostraTotaliFiltrati(entrateTotal, usciteTotal, saldo);
  
  // Popola tabella
  tbody.innerHTML = '';
  risultati
    .sort((a, b) => new Date(b[1].data) - new Date(a[1].data))
    .forEach(([id, t]) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = t.persona || '';
      row.insertCell(1).innerText = t.categoria || '';
      row.insertCell(2).innerText = t.descrizione || '';
      row.insertCell(3).innerText = t.data || '';
      row.insertCell(4).innerText = `€${parseFloat(t.importo).toFixed(2)}`;
      
      const azioniCell = row.insertCell(5);
      azioniCell.innerHTML = `
        <button class="btn-azione" onclick="eliminaTransazione('${id}')">Elimina</button>
      `;
    });
}

/**
 * Reset filtri ricerca
 */
window.resetFiltri = function() {
  // Reset campi
  document.getElementById('searchText').value = '';
  document.getElementById('searchImportoMin').value = '';
  document.getElementById('searchImportoMax').value = '';
  document.getElementById('searchDataDa').value = '';
  document.getElementById('searchDataA').value = '';
  document.getElementById('searchTipo').value = '';
  document.getElementById('searchCategoria').value = '';
  document.getElementById('searchPersona').value = '';
  
  // Nascondi info risultati
  const infoDiv = document.getElementById('searchResultsInfo');
  if (infoDiv) infoDiv.style.display = 'none';
  
  // Nascondi totali filtrati
  const totalsDiv = document.getElementById('searchTotalsInfo');
  if (totalsDiv) totalsDiv.style.display = 'none';
  
  // Ricarica tutte le transazioni
  filtriAttivi = false;
  aggiornaTabella();
};

// ==============================
// INIZIALIZZAZIONE
// ==============================

// Aggiungi al DOMContentLoaded esistente
document.addEventListener('DOMContentLoaded', () => {
  // ... codice esistente ...
  
  // Popola categorie nella ricerca quando sono caricate
  setTimeout(() => {
    popolaCategorieRicerca();
  }, 1000);
  
  // Inizia con filtri collassati
  const section = document.getElementById('searchSection');
  if (section) {
    section.classList.add('collapsed');
  }
});
/* =====================================================
   FUNZIONI RIEPILOGO GIORNALIERO
   Aggiungi queste funzioni nel tuo script.js
   ===================================================== */

/**
 * Formatta la data di oggi in formato italiano
 */
function ottieniDataOggi() {
  const oggi = new Date();
  const giorno = String(oggi.getDate()).padStart(2, '0');
  const mese = String(oggi.getMonth() + 1).padStart(2, '0');
  const anno = oggi.getFullYear();
  return `${giorno}/${mese}/${anno}`;
}

/**
 * Ottieni la data di oggi in formato ISO (YYYY-MM-DD) per confronto
 */
function ottieniDataOggiISO() {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = String(oggi.getMonth() + 1).padStart(2, '0');
  const giorno = String(oggi.getDate()).padStart(2, '0');
  return `${anno}-${mese}-${giorno}`;
}

/**
 * Calcola e aggiorna il riepilogo giornaliero
 */
window.aggiornaRiepilogoGiornaliero = function() {
  const dataOggi = ottieniDataOggiISO();
  
  // Inizializza contatori
  let entrateOggi = 0;
  let usciteOggi = 0;
  let contatoreTransazioni = 0;
  
  // Filtra e calcola transazioni di oggi
  if (typeof transazioni !== 'undefined' && transazioni.length > 0) {
    transazioni.forEach(([id, t]) => {
      if (t.data === dataOggi) {
        contatoreTransazioni++;
        const importo = parseFloat(t.importo) || 0;
        
        if (t.tipo === 'Entrata') {
          entrateOggi += importo;
        } else if (t.tipo === 'Uscita') {
          usciteOggi += importo;
        }
      }
    });
  }
  
  // Calcola saldo
  const saldo = entrateOggi - usciteOggi;
  
  // Aggiorna UI
  aggiornaUIRiepilogoGiornaliero(entrateOggi, usciteOggi, saldo, contatoreTransazioni);
  
  // Calcola e aggiorna medie
  calcolaEAggiornaMedie();
};

/**
 * Aggiorna l'interfaccia del riepilogo giornaliero
 */
function aggiornaUIRiepilogoGiornaliero(entrate, uscite, saldo, contatore) {
  // Aggiorna data
  const dataElement = document.getElementById('dataOggi');
  if (dataElement) {
    dataElement.textContent = ottieniDataOggi();
  }
  
  // Aggiorna entrate
  const entrateElement = document.getElementById('entrateOggi');
  if (entrateElement) {
    entrateElement.textContent = `€${entrate.toFixed(2)}`;
    entrateElement.classList.add('updating');
    setTimeout(() => entrateElement.classList.remove('updating'), 500);
  }
  
  // Aggiorna uscite
  const usciteElement = document.getElementById('usciteOggi');
  if (usciteElement) {
    usciteElement.textContent = `€${uscite.toFixed(2)}`;
    usciteElement.classList.add('updating');
    setTimeout(() => usciteElement.classList.remove('updating'), 500);
  }
  
  // Aggiorna saldo con classe appropriata
  const saldoElement = document.getElementById('saldoOggi');
  if (saldoElement) {
    const segno = saldo > 0 ? '+' : (saldo < 0 ? '-' : '');
    const importoAssoluto = Math.abs(saldo);
    saldoElement.textContent = `${segno}€${importoAssoluto.toFixed(2)}`;
    
    // Rimuovi classi precedenti
    saldoElement.classList.remove('positivo', 'negativo', 'zero');
    
    // Aggiungi classe appropriata
    if (saldo > 0) {
      saldoElement.classList.add('positivo');
    } else if (saldo < 0) {
      saldoElement.classList.add('negativo');
    } else {
      saldoElement.classList.add('zero');
    }
    
    saldoElement.classList.add('updating');
    setTimeout(() => saldoElement.classList.remove('updating'), 500);
  }
  
  // Aggiorna contatore transazioni
  const contatoreElement = document.getElementById('contatoreTransazioniOggi');
  if (contatoreElement) {
    const testo = contatore === 1 
      ? '1 transazione oggi' 
      : `${contatore} transazioni oggi`;
    contatoreElement.textContent = testo;
  }
  
  // Aggiorna lista transazioni oggi
  aggiornaListaTransazioniOggi();
}

/**
 * Inizializza il riepilogo giornaliero al caricamento
 */
function inizializzaRiepilogoGiornaliero() {
  // Imposta la data di oggi
  const dataElement = document.getElementById('dataOggi');
  if (dataElement) {
    dataElement.textContent = ottieniDataOggi();
  }
  
  // Aggiorna i valori (inizialmente saranno 0)
  aggiornaRiepilogoGiornaliero();
}

// ==============================
// MODIFICA FUNZIONI ESISTENTI
// ==============================

/*
 * IMPORTANTE: Aggiungi queste chiamate nelle tue funzioni esistenti
 */

// Quando carichi le transazioni, aggiungi:
// aggiornaRiepilogoGiornaliero();

// Quando aggiungi un'entrata, aggiungi dopo il salvataggio:
// aggiornaRiepilogoGiornaliero();

// Quando aggiungi un'uscita, aggiungi dopo il salvataggio:
// aggiornaRiepilogoGiornaliero();

// Quando elimini una transazione, aggiungi:
// aggiornaRiepilogoGiornaliero();

// Nel DOMContentLoaded, aggiungi:
// inizializzaRiepilogoGiornaliero();
/**
 * Calcola e aggiorna le medie giornaliere e mensili
 */
function calcolaEAggiornaMedie() {
  const oggi = new Date();
  const annoCorrente = oggi.getFullYear();
  const meseCorrente = oggi.getMonth() + 1; // 1-12
  
  // Calcola medie giornaliere (mese corrente)
  const medieGiornaliere = calcolaMediaGiornaliera(annoCorrente, meseCorrente);
  
  // Calcola medie mensili (anno corrente)
  const medieMensili = calcolaMediaMensile(annoCorrente);
  
  // Aggiorna UI
  aggiornaUIMediaGiornaliera(medieGiornaliere, annoCorrente, meseCorrente);
  aggiornaUIMediaMensile(medieMensili, annoCorrente);
}

/**
 * Calcola media giornaliera per un mese specifico
 */
function calcolaMediaGiornaliera(anno, mese) {
  let entrateToTali = 0;
  let usciteTotali = 0;
  const giorniConTransazioni = new Set();
  
  // Formato mese per confronto (es. "2026-01")
  const meseFormato = `${anno}-${String(mese).padStart(2, '0')}`;
  
  if (typeof transazioni !== 'undefined' && transazioni.length > 0) {
    transazioni.forEach(([id, t]) => {
      // Controlla se la transazione è del mese corrente
      if (t.data && t.data.startsWith(meseFormato)) {
        const importo = parseFloat(t.importo) || 0;
        
        // Aggiungi il giorno al set (per contare giorni unici)
        giorniConTransazioni.add(t.data);
        
        if (t.tipo === 'Entrata') {
          entrateToTali += importo;
        } else if (t.tipo === 'Uscita') {
          usciteTotali += importo;
        }
      }
    });
  }
  
  // Calcola numero di giorni con transazioni
  const numeroGiorni = giorniConTransazioni.size;
  
  // Se non ci sono giorni con transazioni, usa 1 per evitare divisione per zero
  const divisore = numeroGiorni > 0 ? numeroGiorni : 1;
  
  return {
    entrateMedia: entrateToTali / divisore,
    usciteMedia: usciteTotali / divisore,
    numeroGiorni: numeroGiorni
  };
}

/**
 * Calcola media mensile per un anno specifico
 */
function calcolaMediaMensile(anno) {
  let entrateToTali = 0;
  let usciteTotali = 0;
  const mesiConTransazioni = new Set();
  
  // Formato anno per confronto (es. "2026")
  const annoFormato = String(anno);
  
  if (typeof transazioni !== 'undefined' && transazioni.length > 0) {
    transazioni.forEach(([id, t]) => {
      // Controlla se la transazione è dell'anno corrente
      if (t.data && t.data.startsWith(annoFormato)) {
        const importo = parseFloat(t.importo) || 0;
        
        // Estrai il mese (formato YYYY-MM)
        const mese = t.data.substring(0, 7); // "2026-01"
        mesiConTransazioni.add(mese);
        
        if (t.tipo === 'Entrata') {
          entrateToTali += importo;
        } else if (t.tipo === 'Uscita') {
          usciteTotali += importo;
        }
      }
    });
  }
  
  // Calcola numero di mesi con transazioni
  const numeroMesi = mesiConTransazioni.size;
  
  // Se non ci sono mesi con transazioni, usa 1 per evitare divisione per zero
  const divisore = numeroMesi > 0 ? numeroMesi : 1;
  
  return {
    entrateMedia: entrateToTali / divisore,
    usciteMedia: usciteTotali / divisore,
    numeroMesi: numeroMesi
  };
}

/**
 * Aggiorna UI media giornaliera
 */
function aggiornaUIMediaGiornaliera(medie, anno, mese) {
  // Nomi mesi in italiano
  const nomiMesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  
  // Aggiorna periodo
  const periodoElement = document.getElementById('periodoGiornaliero');
  if (periodoElement) {
    const nomeMese = nomiMesi[mese - 1];
    periodoElement.textContent = `(${nomeMese} ${anno})`;
  }
  
  // Aggiorna entrate media
  const entrateElement = document.getElementById('mediaGiornalieraEntrate');
  if (entrateElement) {
    const valore = medie.entrateMedia.toFixed(2);
    entrateElement.textContent = `€${valore}/giorno`;
  }
  
  // Aggiorna uscite media
  const usciteElement = document.getElementById('mediaGiornalieraUscite');
  if (usciteElement) {
    const valore = medie.usciteMedia.toFixed(2);
    usciteElement.textContent = `€${valore}/giorno`;
  }
}

/**
 * Aggiorna UI media mensile
 */
function aggiornaUIMediaMensile(medie, anno) {
  // Aggiorna periodo
  const periodoElement = document.getElementById('periodoMensile');
  if (periodoElement) {
    periodoElement.textContent = `(Anno ${anno})`;
  }
  
  // Aggiorna entrate media
  const entrateElement = document.getElementById('mediaMensileEntrate');
  if (entrateElement) {
    const valore = medie.entrateMedia.toFixed(2);
    entrateElement.textContent = `€${valore}/mese`;
  }
  
  // Aggiorna uscite media
  const usciteElement = document.getElementById('mediaMensileUscite');
  if (usciteElement) {
    const valore = medie.usciteMedia.toFixed(2);
    usciteElement.textContent = `€${valore}/mese`;
  }
}

/**
 * Formatta numero con separatore migliaia
 */
function formattaNumeroConSeparatore(numero) {
  return numero.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
/**
 * Toggle apertura/chiusura dropdown transazioni oggi
 */
window.toggleTransazioniOggi = function() {
  const dropdown = document.getElementById('transazioniOggiDropdown');
  const icon = document.getElementById('dropdownIcon');
  
  if (!dropdown || !icon) return;
  
  if (dropdown.style.display === 'none') {
    // Apri dropdown
    dropdown.style.display = 'block';
    icon.classList.add('open');
  } else {
    // Chiudi dropdown
    dropdown.style.display = 'none';
    icon.classList.remove('open');
  }
};

/**
 * Aggiorna la lista delle transazioni di oggi nel dropdown
 */
function aggiornaListaTransazioniOggi() {
  const lista = document.getElementById('listaTransazioniOggi');
  
  if (!lista) return;
  
  const dataOggi = ottieniDataOggiISO();
  
  // Filtra transazioni di oggi
  const transazioniOggi = [];
  
  if (typeof transazioni !== 'undefined' && transazioni.length > 0) {
    transazioni.forEach(([id, t]) => {
      if (t.data === dataOggi) {
        transazioniOggi.push(t);
      }
    });
  }
  
  // Svuota lista
  lista.innerHTML = '';
  
  // Se non ci sono transazioni
  if (transazioniOggi.length === 0) {
    lista.innerHTML = `
      <div class="dropdown-lista-vuota">
        Nessuna transazione oggi
      </div>
    `;
    return;
  }
  
  // Ordina per tipo (prima entrate, poi uscite) e poi per importo
  transazioniOggi.sort((a, b) => {
    // Prima ordina per tipo (Entrata prima di Uscita)
    if (a.tipo !== b.tipo) {
      return a.tipo === 'Entrata' ? -1 : 1;
    }
    // Poi ordina per importo decrescente
    return parseFloat(b.importo) - parseFloat(a.importo);
  });
  
  // Popola lista
  transazioniOggi.forEach(t => {
    const item = document.createElement('div');
    item.className = 'transazione-oggi-item';
    
    // Determina icona e classe
    const isEntrata = t.tipo === 'Entrata';
    const icon = isEntrata ? '🟢' : '🔴';
    const importoClass = isEntrata ? 'entrata' : 'uscita';
    const segno = isEntrata ? '+' : '-';
    
    // Descrizione (usa categoria se descrizione vuota)
    const descrizione = t.descrizione || t.categoria || 'Transazione';
    const categoria = t.categoria || '';
    
    item.innerHTML = `
      <div class="transazione-icon">${icon}</div>
      <div class="transazione-dettagli">
        <div class="transazione-descrizione">${descrizione}</div>
        ${categoria ? `<div class="transazione-categoria">${categoria}</div>` : ''}
      </div>
      <div class="transazione-importo ${importoClass}">
        ${segno}€${parseFloat(t.importo).toFixed(2)}
      </div>
    `;
    
    lista.appendChild(item);
  });
}
