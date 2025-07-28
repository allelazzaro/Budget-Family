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

// Calcola e mostra le differenze nei box per il confronto mensile e annuale.
// Ogni box è cliccabile e al click viene chiamata la funzione apriDettaglioDiff() con il parametro specifico.
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

  const totaliMeseCorrenteGiulia = calcolaTotali(meseFiltro, 'month', 'Giulia');
  const totaliMesePrecedenteGiulia = calcolaTotali(meseConfronto, 'month', 'Giulia');
  const diffMeseGiulia = {
    entrate: totaliMeseCorrenteGiulia.entrate - totaliMesePrecedenteGiulia.entrate,
    uscite: totaliMeseCorrenteGiulia.uscite - totaliMesePrecedenteGiulia.uscite,
    saldo: totaliMeseCorrenteGiulia.saldo - totaliMesePrecedenteGiulia.saldo
  };

  const htmlMese = `
    <div onclick="apriDettaglioDiff('meseTotal')" style="cursor:pointer;">
      <h3>Mese Totale: ${meseFiltro} vs ${meseConfronto}</h3>
      <p>Entrate: €${totaliMeseCorrente.entrate.toFixed(2)} → €${totaliMesePrecedente.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliMeseCorrente.uscite.toFixed(2)} → €${totaliMesePrecedente.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliMeseCorrente.saldo.toFixed(2)} → €${totaliMesePrecedente.saldo.toFixed(2)}<br>
         <span class="${diffMeseTotale.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">Diff: €${diffMeseTotale.saldo.toFixed(2)}</span></p>
    </div>
    <div onclick="apriDettaglioDiff('meseAlessio')" style="cursor:pointer;">
      <h4>Alessio (Mese)</h4>
      <p>Entrate: €${totaliMeseCorrenteAlessio.entrate.toFixed(2)} → €${totaliMesePrecedenteAlessio.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliMeseCorrenteAlessio.uscite.toFixed(2)} → €${totaliMesePrecedenteAlessio.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliMeseCorrenteAlessio.saldo.toFixed(2)} → €${totaliMesePrecedenteAlessio.saldo.toFixed(2)}<br>
         <span class="${diffMeseAlessio.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">Diff: €${diffMeseAlessio.saldo.toFixed(2)}</span></p>
    </div>
    <div onclick="apriDettaglioDiff('meseGiulia')" style="cursor:pointer;">
      <h4>Giulia (Mese)</h4>
      <p>Entrate: €${totaliMeseCorrenteGiulia.entrate.toFixed(2)} → €${totaliMesePrecedenteGiulia.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliMeseCorrenteGiulia.uscite.toFixed(2)} → €${totaliMesePrecedenteGiulia.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliMeseCorrenteGiulia.saldo.toFixed(2)} → €${totaliMesePrecedenteGiulia.saldo.toFixed(2)}<br>
         <span class="${diffMeseGiulia.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">Diff: €${diffMeseGiulia.saldo.toFixed(2)}</span></p>
    </div>
  `;

  // --- Confronto Annuale ---
  const annoCorrente = meseFiltro.slice(0, 4);
  const annoPrecedente = (parseInt(annoCorrente) - 1).toString();
  const totaliAnnoCorrente = calcolaTotali(annoCorrente, 'year');
  const totaliAnnoPrecedente = calcolaTotali(annoPrecedente, 'year');
  const diffAnnoTotale = {
    entrate: totaliAnnoCorrente.entrate - totaliAnnoPrecedente.entrate,
    uscite: totaliAnnoCorrente.uscite - totaliAnnoPrecedente.uscite,
    saldo: totaliAnnoCorrente.saldo - totaliAnnoPrecedente.saldo
  };

  const totaliAnnoCorrenteAlessio = calcolaTotali(annoCorrente, 'year', 'Alessio');
  const totaliAnnoPrecedenteAlessio = calcolaTotali(annoPrecedente, 'year', 'Alessio');
  const diffAnnoAlessio = {
    entrate: totaliAnnoCorrenteAlessio.entrate - totaliAnnoPrecedenteAlessio.entrate,
    uscite: totaliAnnoCorrenteAlessio.uscite - totaliAnnoPrecedenteAlessio.uscite,
    saldo: totaliAnnoCorrenteAlessio.saldo - totaliAnnoPrecedenteAlessio.saldo
  };

  const totaliAnnoCorrenteGiulia = calcolaTotali(annoCorrente, 'year', 'Giulia');
  const totaliAnnoPrecedenteGiulia = calcolaTotali(annoPrecedente, 'year', 'Giulia');
  const diffAnnoGiulia = {
    entrate: totaliAnnoCorrenteGiulia.entrate - totaliAnnoPrecedenteGiulia.entrate,
    uscite: totaliAnnoCorrenteGiulia.uscite - totaliAnnoPrecedenteGiulia.uscite,
    saldo: totaliAnnoCorrenteGiulia.saldo - totaliAnnoPrecedenteGiulia.saldo
  };

  const htmlAnno = `
    <div onclick="apriDettaglioDiff('annoTotal')" style="cursor:pointer;">
      <h3>Anno Totale: ${annoCorrente} vs ${annoPrecedente}</h3>
      <p>Entrate: €${totaliAnnoCorrente.entrate.toFixed(2)} → €${totaliAnnoPrecedente.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliAnnoCorrente.uscite.toFixed(2)} → €${totaliAnnoPrecedente.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliAnnoCorrente.saldo.toFixed(2)} → €${totaliAnnoPrecedente.saldo.toFixed(2)}<br>
         <span class="${diffAnnoTotale.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">
           Diff: €${diffAnnoTotale.saldo.toFixed(2)}
         </span></p>
    </div>
    <div onclick="apriDettaglioDiff('annoAlessio')" style="cursor:pointer;">
      <h4>Alessio (Anno)</h4>
      <p>Entrate: €${totaliAnnoCorrenteAlessio.entrate.toFixed(2)} → €${totaliAnnoPrecedenteAlessio.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliAnnoCorrenteAlessio.uscite.toFixed(2)} → €${totaliAnnoPrecedenteAlessio.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliAnnoCorrenteAlessio.saldo.toFixed(2)} → €${totaliAnnoPrecedenteAlessio.saldo.toFixed(2)}<br>
         <span class="${diffAnnoAlessio.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">
           Diff: €${diffAnnoAlessio.saldo.toFixed(2)}
         </span></p>
    </div>
    <div onclick="apriDettaglioDiff('annoGiulia')" style="cursor:pointer;">
      <h4>Giulia (Anno)</h4>
      <p>Entrate: €${totaliAnnoCorrenteGiulia.entrate.toFixed(2)} → €${totaliAnnoPrecedenteGiulia.entrate.toFixed(2)}</p>
      <p>Uscite: €${totaliAnnoCorrenteGiulia.uscite.toFixed(2)} → €${totaliAnnoPrecedenteGiulia.uscite.toFixed(2)}</p>
      <p>Saldo: €${totaliAnnoCorrenteGiulia.saldo.toFixed(2)} → €${totaliAnnoPrecedenteGiulia.saldo.toFixed(2)}<br>
         <span class="${diffAnnoGiulia.saldo >= 0 ? 'differenza-positiva' : 'differenza-negativa'}">
           Diff: €${diffAnnoGiulia.saldo.toFixed(2)}
         </span></p>
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
const db = getDatabase(app);
const auth = getAuth(app);
const transazioniRef = ref(db, 'transazioni');

let utenteCorrente = null;
let transazioni = [];
let graficoTorta;

// Gestione autenticazione
onAuthStateChanged(auth, (utente) => {
  if (utente) {
    utenteCorrente = utente;
    console.log("Utente autenticato:", utente);
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "block";
    aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
  } else {
    utenteCorrente = null;
    console.log("Nessun utente autenticato.");
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("appContainer").style.display = "none";
  }
});

// FUNZIONI DI AUTENTICAZIONE
window.registrati = function () {
  const email = document.getElementById('emailRegistrazione').value.trim();
  const password = document.getElementById('passwordRegistrazione').value.trim();
  if (!email || !password) {
    alert("Per favore, inserisci un'email e una password valide.");
    return;
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => { alert("Registrazione completata!"); })
    .catch((error) => {
      console.error("Errore durante la registrazione:", error);
      alert("Errore durante la registrazione: " + error.message);
    });
};

window.accedi = function () {
  const email = document.getElementById('emailLogin').value.trim();
  const password = document.getElementById('passwordLogin').value.trim();
  if (!email || !password) {
    alert("Per favore, inserisci un'email e una password valide.");
    return;
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => { alert("Accesso effettuato con successo!"); })
    .catch((error) => {
      console.error("Errore durante l'accesso:", error);
      alert("Errore durante l'accesso: " + error.message);
    });
};

window.esci = function () {
  signOut(auth)
    .then(() => { alert("Logout effettuato con successo!"); })
    .catch((error) => { console.error("Errore durante il logout:", error); });
};

function salvaFiltroMese() {
  const meseFiltroElement = document.getElementById('meseFiltro');
  if (meseFiltroElement) {
    const meseFiltro = meseFiltroElement.value;
    localStorage.setItem('meseFiltro', meseFiltro);
    filtraPerMese();
  } else {
    console.error("Elemento 'meseFiltro' non trovato.");
  }
}
document.getElementById('meseFiltro').addEventListener('change', salvaFiltroMese);

function getDataCorrente() {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = String(oggi.getMonth() + 1).padStart(2, '0');
  const giorno = String(oggi.getDate()).padStart(2, '0');
  return `${anno}-${mese}-${giorno}`;
}
function impostaDataCorrente() {
  const dataCorrente = getDataCorrente();
  document.getElementById('dataEntrata').value = dataCorrente;
  document.getElementById('dataUscita').value = dataCorrente;
  document.getElementById('meseFiltro').value = dataCorrente.slice(0, 7);
}

onValue(transazioniRef, (snapshot) => {
  transazioni = snapshot.val() ? Object.entries(snapshot.val()) : [];
  aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
  aggiornaRiepiloghi();
  aggiornaRiepilogoMensile();
  aggiornaGraficoSpesePerCategoria();
  calcolaDifferenze();
});

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

function formattaData(data) {
  const [anno, mese, giorno] = data.split("-");
  return `${giorno}/${mese}`;
}

function aggiornaListaTransazioni(meseFiltro = null) {
  const listaTransazioniElement = document.getElementById('listaTransazioni');
  if (!listaTransazioniElement) {
    console.error("Elemento 'listaTransazioni' non trovato.");
    return;
  }
  listaTransazioniElement.innerHTML = '';
  transazioni.forEach(([id, t]) => {
    const transazioneMese = t.data.slice(0, 7);
    if (!meseFiltro || transazioneMese === meseFiltro) {
      const dataFormattata = formattaData(t.data);
      const classeTransazione = t.tipo === 'Uscita' ? 'uscita' : 'entrata';
      const nuovaRiga = `
        <tr>
          <td>${t.persona}</td>
          <td>${t.categoria || ''}</td>
          <td>${t.descrizione || ''}</td>
          <td>${dataFormattata}</td>
          <td class="${classeTransazione}">€${parseFloat(t.importo).toFixed(2)}</td>
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

function aggiornaRiepiloghi() {
  const meseFiltro = document.getElementById('meseFiltro').value;
  const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();
  let totaleEntrate = 0, totaleUscite = 0;
  let totaleGiuliaEntrate = 0, totaleGiuliaUscite = 0;
  let totaleAlessioEntrate = 0, totaleAlessioUscite = 0;
  transazioni.forEach(([id, t]) => {
    const annoTransazione = t.data.slice(0, 4);
    if (annoTransazione === annoSelezionato) {
      if (t.tipo === 'Entrata') {
        totaleEntrate += t.importo;
        if (t.persona === 'Giulia') totaleGiuliaEntrate += t.importo;
        else if (t.persona === 'Alessio') totaleAlessioEntrate += t.importo;
      } else if (t.tipo === 'Uscita') {
        totaleUscite += t.importo;
        if (t.persona === 'Giulia') totaleGiuliaUscite += t.importo;
        else if (t.persona === 'Alessio') totaleAlessioUscite += t.importo;
      }
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

function aggiornaRiepilogoMensile() {
  const meseSelezionato = document.getElementById('meseFiltro').value;
  let totaleEntrateMese = 0, totaleUsciteMese = 0;
  transazioni.forEach(([id, t]) => {
    if (t.data.slice(0, 7) === meseSelezionato) {
      if (t.tipo === 'Entrata') totaleEntrateMese += t.importo;
      else if (t.tipo === 'Uscita') totaleUsciteMese += t.importo;
    }
  });
  const saldoMese = totaleEntrateMese - totaleUsciteMese;
  document.getElementById('riepilogoMese').innerHTML = `
    <div>Entrate: €${totaleEntrateMese.toFixed(2)}</div>
    <div>Uscite: €${totaleUsciteMese.toFixed(2)}</div>
    <div>Saldo: €${saldoMese.toFixed(2)}</div>
  `;
}

window.filtraPerMese = function () {
  const meseSelezionato = document.getElementById('meseFiltro').value;
  aggiornaListaTransazioni(meseSelezionato);
  aggiornaRiepilogoMensile();
  aggiornaRiepiloghi();
  aggiornaGraficoSpesePerCategoria();
  calcolaDifferenze();
};

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
  if (!importo || isNaN(importo) || parseFloat(importo) <= 0) {
    alert("Inserisci un importo valido per l'uscita.");
    return;
  }
  aggiungiTransazione(persona, 'Uscita', categoria, descrizione, importo, data);
  document.getElementById("descrizioneUscita").value = '';
  document.getElementById("importoUscita").value = '';
};

window.cancellaTransazione = function (id) {
  remove(ref(db, `transazioni/${id}`))
    .then(() => {
      console.log("Transazione cancellata con successo");
      aggiornaRiepiloghi();
      aggiornaRiepilogoMensile();
      aggiornaListaTransazioni(document.getElementById('meseFiltro').value);
    })
    .catch((error) => {
      console.error("Errore nella cancellazione della transazione:", error);
    });
};

window.modificaTransazione = function (id) {
  const nuovoImporto = prompt("Inserisci il nuovo importo:");
  if (nuovoImporto !== null && !isNaN(nuovoImporto) && nuovoImporto > 0) {
    const transazioneRef = ref(db, `transazioni/${id}`);
    update(transazioneRef, { importo: parseFloat(nuovoImporto) })
      .catch((error) => {
        console.error("Errore nella modifica della transazione:", error);
      });
  }
};

function aggiornaGraficoSpesePerCategoria() {
  const meseFiltro = document.getElementById('meseFiltro').value;
  const annoSelezionato = meseFiltro ? meseFiltro.slice(0, 4) : new Date().getFullYear().toString();
  const spesePerCategoria = {};
  transazioni.forEach(([id, t]) => {
    const annoTransazione = t.data.slice(0, 4);
    if (t.tipo === 'Uscita' && annoTransazione === annoSelezionato) {
      spesePerCategoria[t.categoria] = (spesePerCategoria[t.categoria] || 0) + t.importo;
    }
  });
  const categorie = Object.keys(spesePerCategoria);
  const importi = Object.values(spesePerCategoria);
  if (graficoTorta) {
    graficoTorta.destroy();
  }
  const ctx = document.getElementById('graficoTortaSpese').getContext('2d');
  graficoTorta = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categorie,
      datasets: [{
        label: 'Spese per Categoria',
        data: importi,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#FFB6C1', '#87CEFA', '#FFD700',
          '#20B2AA', '#9370DB', '#FFA07A', '#708090'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 15, padding: 15 },
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const valore = tooltipItem.raw;
              const totale = importi.reduce((a, b) => a + b, 0);
              const percentuale = ((valore / totale) * 100).toFixed(2);
              return `${tooltipItem.label}: €${valore.toFixed(2)} (${percentuale}%)`;
            },
          },
        },
        title: {
          display: true,
          text: `Distribuzione Spese per Categoria (${annoSelezionato})`,
          font: { size: 18 },
        },
      },
    },
  });
}

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

function aggiornaNomeUtente(nomeUtente) {
  document.getElementById('personaEntrata').value = nomeUtente;
  document.getElementById('personaUscita').value = nomeUtente;
  document.getElementById('loginContainer').style.display = 'none';
}

window.vaiAllaPaginaDettagli = function (persona, tipo) {
  const url = `dettagli.html?persona=${encodeURIComponent(persona)}&tipo=${encodeURIComponent(tipo)}`;
  console.log("Navigazione verso:", url);
  window.location.href = url;
};

window.apriDettaglioDiff = function (tipoDiff) {
  // Salva in localStorage il tipo di dettaglio (es. "meseGiulia", "annoAlessio", ecc.)
  localStorage.setItem('tipoDiff', tipoDiff);
  const meseFiltro = document.getElementById('meseFiltro').value;
  if (tipoDiff.startsWith("anno")) {
    const annoCorrente = meseFiltro.slice(0, 4);
    localStorage.setItem('annoDiff', annoCorrente);
    localStorage.setItem('annoDiffPrev', (parseInt(annoCorrente) - 1).toString());
  } else if (tipoDiff.startsWith("mese")) {
    localStorage.setItem('meseDiff', meseFiltro);
    localStorage.setItem('meseDiffPrev', getStessoMeseAnnoPrecedente(meseFiltro));
  }
  console.log("TipoDiff salvato:", tipoDiff);
  window.location.href = "dettagliDifferenze.html";
};

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
      if (!datiRiepilogo[mese][categoria]) datiRiepilogo[mese][categoria] = { Alessio: 0, Giulia: 0 };
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
  const headerRow = ["Categoria", ...mesi.flatMap(mese => [`${mese} Alessio`, `${mese} Giulia`]), "Totale Categoria"];
  worksheet.addRow(headerRow);
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "007BFF" } };
    cell.alignment = { horizontal: "center" };
  });
  const totalColumns = new Array(mesi.length * 2).fill(0);
  let totaleGenerale = 0;
  categorieTotali.forEach(({ categoria }) => {
    const row = [categoria];
    let totaleRiga = 0;
    mesi.forEach((mese, idx) => {
      const alessioValue = datiRiepilogo[mese][categoria]?.Alessio || 0;
      const giuliaValue = datiRiepilogo[mese][categoria]?.Giulia || 0;
      row.push(alessioValue);
      row.push(giuliaValue);
      totalColumns[idx * 2] += alessioValue;
      totalColumns[idx * 2 + 1] += giuliaValue;
      totaleRiga += alessioValue + giuliaValue;
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
    const colAlessio = 2 + idx * 2;
    const colGiulia = colAlessio + 1;
    worksheet.getColumn(colAlessio).eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && rowNumber !== totaleRowRef.number) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "ADD8E6" } };
      }
    });
    worksheet.getColumn(colGiulia).eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && rowNumber !== totaleRowRef.number) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB6C1" } };
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
// alla fine di script.js
window.registrati       = registrati;
window.accedi           = accedi;
window.salvaNomeUtente  = salvaNomeUtente;
// ==============================
// AUTO‑LOAD DIFFERENZE SU MOBILE
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const filtro = document.getElementById('meseFiltro');

  // se il campo mese ha già un valore salvato, calcola subito
  if (filtro && filtro.value) calcolaDifferenze();

  // ogni volta che tocchi il titolo/sezione differenze, ricalcola
  const diffSection = document.getElementById('differenze');
  diffSection.addEventListener('click', calcolaDifferenze);
});
