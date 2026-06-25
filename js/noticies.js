// ─── LOGIN (Firebase Auth) ────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyC1XGWamPI4eTedacK84uMJ-8hHgGDCZps",
  authDomain: "treballs-recerca.firebaseapp.com",
  projectId: "treballs-recerca",
  storageBucket: "treballs-recerca.firebasestorage.app",
  messagingSenderId: "624915028496",
  appId: "1:624915028496:web:3fda3add683616e0060895"
};

firebase.initializeApp(firebaseConfig);

const DOMINI_PERMET = '@apellesmestres.cat';

firebase.auth().onAuthStateChanged(function (user) {
  if (user && user.email.endsWith(DOMINI_PERMET)) {
    document.getElementById('login-overlay').hidden = true;
    document.getElementById('contingut-principal').hidden = false;
    carregarNoticies();
  } else {
    if (user) firebase.auth().signOut();
    document.getElementById('login-overlay').hidden = false;
    document.getElementById('contingut-principal').hidden = true;
    if (user) document.getElementById('login-error').hidden = false;
  }
});

document.getElementById('btn-google-login').addEventListener('click', function () {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ hd: 'apellesmestres.cat' });
  document.getElementById('login-error').hidden = true;
  firebase.auth().signInWithPopup(provider).catch(function () {
    document.getElementById('login-error').hidden = false;
  });
});

function logout() {
  firebase.auth().signOut();
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── MODE FOSC ────────────────────────────────────────────────────────────────
(function setupTema() {
  const btn = document.getElementById('btn-tema');
  function actualitzarIcona() {
    const fosc = document.documentElement.dataset.tema === 'fosc';
    btn.title = fosc ? 'Activar mode clar' : 'Activar mode fosc';
    btn.setAttribute('aria-label', fosc ? 'Activar mode clar' : 'Activar mode fosc');
    btn.innerHTML = fosc
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  actualitzarIcona();
  btn.addEventListener('click', () => {
    const nou = document.documentElement.dataset.tema === 'fosc' ? 'clar' : 'fosc';
    document.documentElement.dataset.tema = nou;
    localStorage.setItem('tema', nou);
    actualitzarIcona();
  });
})();
// ─────────────────────────────────────────────────────────────────────────────

// ─── NOTÍCIES ─────────────────────────────────────────────────────────────────
const CSV_NOTICIES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtAl6dUB2E0h_79JLFoYRq0CFXbSTi_JID8BgeinxLsSUH1kgzwD8_GaPu4XEsPCpdqggLhckD0BXW/pub?output=csv&gid=735185283';

async function carregarNoticies() {
  try {
    const resp = await fetch(CSV_NOTICIES, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const noticies = parseCSVNoticies(text);
    renderNoticies(noticies);
  } catch (err) {
    document.getElementById('llista-noticies').innerHTML = '';
    document.getElementById('missatge-error-noticies').hidden = false;
    document.getElementById('error-detall-noticies').textContent = err.message;
  }
}

function parseCSVNoticies(text) {
  const files = parseCSVComplet(text);
  if (files.length < 2) return [];
  const headers = files[0].map(h => h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim());
  const idx = {
    data:   headers.findIndex(h => h.startsWith('dat')),
    titol:  headers.findIndex(h => h.startsWith('titol') || h.startsWith('titl')),
    text:   headers.findIndex(h => h === 'text' || h.startsWith('cos') || h.startsWith('contingut')),
    imatge: headers.findIndex(h => h.startsWith('imatge') || h.startsWith('imag') || h.startsWith('foto')),
    video:  headers.findIndex(h => h.startsWith('video') || h.startsWith('vid')),
    enllac: headers.findIndex(h => h.startsWith('enlla') || h === 'link' || h === 'url'),
  };

  return files.slice(1)
    .map(cels => ({
      data:   cel(cels, idx.data),
      titol:  cel(cels, idx.titol),
      text:   cel(cels, idx.text),
      imatge: cel(cels, idx.imatge),
      video:  cel(cels, idx.video),
      enllac: cel(cels, idx.enllac),
    }))
    .filter(n => n.titol)
    .sort((a, b) => b.data.localeCompare(a.data));
}

function renderNoticies(noticies) {
  const cont = document.getElementById('llista-noticies');
  if (noticies.length === 0) {
    cont.innerHTML = '';
    document.getElementById('missatge-buit-noticies').hidden = false;
    return;
  }
  cont.innerHTML = noticies.map(n => htmlNoticia(n)).join('');
}

function htmlNoticia(n) {
  const dataFormateada = formatarData(n.data);

  const imatgeHtml = n.imatge
    ? `<div class="noticia-imatge-wrap"><img src="${escHtml(n.imatge)}" alt="${escHtml(n.titol)}" class="noticia-imatge" loading="lazy"></div>`
    : '';

  const videoId = extraureVideoId(n.video);
  const videoHtml = videoId
    ? `<div class="noticia-video-wrap"><iframe class="noticia-video" src="https://www.youtube-nocookie.com/embed/${escHtml(videoId)}" title="${escHtml(n.titol)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
    : '';

  const textHtml = n.text
    ? `<div class="noticia-text">${escHtml(n.text).replace(/\n/g, '<br>')}</div>`
    : '';

  const btnEnllac = n.enllac
    ? `<a href="${escHtml(n.enllac)}" class="btn-noticia-mes" target="_blank" rel="noopener">Llegir més <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>`
    : '';

  return `
    <article class="noticia-card">
      <div class="noticia-cap">
        ${dataFormateada ? `<time class="noticia-data" datetime="${escHtml(n.data)}">${dataFormateada}</time>` : ''}
        <h2 class="noticia-titol">${escHtml(n.titol)}</h2>
      </div>
      ${imatgeHtml}
      ${textHtml}
      ${videoHtml}
      ${btnEnllac ? `<div class="noticia-peu">${btnEnllac}</div>` : ''}
    </article>`;
}

function formatarData(data) {
  if (!data) return '';
  const d = new Date(data);
  if (isNaN(d)) return data;
  return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function extraureVideoId(val) {
  if (!val) return null;
  const v = val.trim();
  let m = v.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = v.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = v.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  return null;
}

// ─── UTILITATS CSV ────────────────────────────────────────────────────────────
function parseCSVComplet(text) {
  const files = [];
  let fila = [], camp = '', entreCometes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (entreCometes) {
      if (c === '"' && text[i + 1] === '"') { camp += '"'; i++; }
      else if (c === '"') { entreCometes = false; }
      else { camp += c; }
    } else {
      if (c === '"') { entreCometes = true; }
      else if (c === ',') { fila.push(camp.trim()); camp = ''; }
      else if (c === '\n') {
        fila.push(camp.trim()); camp = '';
        if (fila.some(f => f !== '')) files.push(fila);
        fila = [];
      } else if (c !== '\r') { camp += c; }
    }
  }
  if (camp || fila.length > 0) { fila.push(camp.trim()); if (fila.some(f => f !== '')) files.push(fila); }
  return files;
}

function cel(cels, i) { return (i >= 0 && i < cels.length) ? cels[i].replace(/^"|"$/g, '').trim() : ''; }

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
