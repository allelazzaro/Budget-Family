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
  const importo = document.getElementById('importoEntrata').value;
  const data = document.getElementById('dataEntrata').value;
  if (!importo || !data) {
    alert("Compila tutti i campi!");
    return;
  }
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
  const importo = document.getElementById('importoUscita').value;
  const data = document.getElementById('dataUscita').value;
  if (!importo || !data) {
    alert("Compila tutti i campi obbligatori!");
    return;
  }
  const nuovaTransazione = {
    tipo: "Uscita",
    persona: persona,
    categoria: categoria,
    descrizione: descrizione,
    importo: parseFloat(importo),
    data: data
  };
  push(ref(db, 'transazioni'), nuovaTransazione);
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
});