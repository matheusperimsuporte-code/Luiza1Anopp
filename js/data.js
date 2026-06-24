/**
 * data.js — camada de dados via Firebase Firestore + Storage
 * Imagens são salvas no Firebase Storage (sem limite de 1MB).
 */

// ── Firebase SDK (via CDN ESM) ────────────────────────────────────
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref as sRef, uploadString, getDownloadURL }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCCj-CIoCP-PI3Yp5aIlJYVVx5pL67HPgg",
  authDomain:        "luiza1ano.firebaseapp.com",
  projectId:         "luiza1ano",
  storageBucket:     "luiza1ano.firebasestorage.app",
  messagingSenderId: "580644389102",
  appId:             "1:580644389102:web:3f4bca04a56144fd4b73ff",
  measurementId:     "G-MJNCZ8BG3N"
};

const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);
const storage     = getStorage(firebaseApp);

// ── Referências dos documentos ────────────────────────────────────
const REF_CONFIG = doc(db, "luisa_db", "config");
const REF_GIFTS  = doc(db, "luisa_db", "gifts_meta");
const REF_GUESTS = doc(db, "luisa_db", "guests_meta");

// ── Dados padrão ──────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  partyDate:    '20 de Julho de 2025',
  partyTime:    '14h00',
  partyPlace:   'A definir',
  pixKey:       'cc361e00-0bfe-490d-a2eb-580aaa651872',
  pixOwner:     'Matheus Valenciano Nunes',
  pixKeyType:   'chave aleatória',
  pixCity:      'Rinopolis',
  heroTitle:    'Luísa',
  heroSubtitle: 'Venha celebrar com a gente o primeiro ano de vida da nossa pequena princesa! 🌸',
  adminUser:    'admin',
  adminPass:    'luisa2025',
};

const DEFAULT_GIFTS = [
  { id: 1,  icon: '🧸', name: 'Ursinho de Pelúcia Grande',          desc: 'Macio e fofo, perfeito para abraços!',           price: 120, image: '', chosen: false, chosenBy: '' },
  { id: 2,  icon: '🎠', name: 'Cavalinho de Balanço',               desc: 'Para as primeiras aventuras da Luísa.',          price: 250, image: '', chosen: false, chosenBy: '' },
  { id: 3,  icon: '📚', name: 'Coleção de Livrinhos',               desc: '5 livros de histórias para bebê.',               price: 90,  image: '', chosen: false, chosenBy: '' },
  { id: 4,  icon: '🎵', name: 'Chocalho Musical',                   desc: 'Sons suaves que acalmam e encantam.',            price: 60,  image: '', chosen: false, chosenBy: '' },
  { id: 5,  icon: '🛁', name: 'Kit Banho Divertido',                desc: 'Patinhos, bolinhas e espumas coloridas.',        price: 80,  image: '', chosen: false, chosenBy: '' },
  { id: 6,  icon: '🎀', name: 'Caixa de Roupinhas',                 desc: 'Conjuntos fofos tamanho 12–18 meses.',           price: 180, image: '', chosen: false, chosenBy: '' },
  { id: 7,  icon: '🧩', name: 'Tapete de Atividades',               desc: 'Estimulação sensorial com muito colorido.',      price: 150, image: '', chosen: false, chosenBy: '' },
  { id: 8,  icon: '🎈', name: 'Mesa de Atividades',                 desc: 'Para explorar, descobrir e aprender.',           price: 320, image: '', chosen: false, chosenBy: '' },
  { id: 9,  icon: '🌟', name: 'Mobile Musical',                     desc: 'Estrelas e músicas para o bercinho.',            price: 100, image: '', chosen: false, chosenBy: '' },
  { id: 10, icon: '🏖️', name: 'Kit Praia Bebê',                     desc: 'Barraquinha, tapete e brinquedos de areia.',     price: 140, image: '', chosen: false, chosenBy: '' },
  { id: 11, icon: '🦆', name: 'Banheira Inflável',                  desc: 'Segura e divertida para o banho.',               price: 110, image: '', chosen: false, chosenBy: '' },
  { id: 12, icon: '💜', name: 'Surpresa da Mamãe (qualquer valor)', desc: 'Contribua com o valor que quiser!',              price: 50,  image: '', chosen: false, chosenBy: '' },
];

// ── Cache local ───────────────────────────────────────────────────
let _cache = { config: null, gifts: null, guests: null };

// ── Inicialização ─────────────────────────────────────────────────
async function _init() {
  const cfgSnap = await getDoc(REF_CONFIG);
  _cache.config = cfgSnap.exists()
    ? { ...DEFAULT_CONFIG, ...cfgSnap.data() }
    : DEFAULT_CONFIG;
  if (!cfgSnap.exists()) await setDoc(REF_CONFIG, DEFAULT_CONFIG);

  const giftsSnap = await getDoc(REF_GIFTS);
  _cache.gifts = giftsSnap.exists() ? (giftsSnap.data().list || []) : [...DEFAULT_GIFTS];
  if (!giftsSnap.exists()) await setDoc(REF_GIFTS, { list: DEFAULT_GIFTS });

  const guestsSnap = await getDoc(REF_GUESTS);
  _cache.guests = guestsSnap.exists() ? (guestsSnap.data().list || []) : [];
  if (!guestsSnap.exists()) await setDoc(REF_GUESTS, { list: [] });
}

// ── Escuta em tempo real ──────────────────────────────────────────
function _listenRealtime(onGiftsChange, onGuestsChange, onConfigChange) {
  onSnapshot(REF_GIFTS,  s => { if (s.exists()) { _cache.gifts  = s.data().list || []; if (onGiftsChange)  onGiftsChange(_cache.gifts);   } });
  onSnapshot(REF_GUESTS, s => { if (s.exists()) { _cache.guests = s.data().list || []; if (onGuestsChange) onGuestsChange(_cache.guests); } });
  onSnapshot(REF_CONFIG, s => { if (s.exists()) { _cache.config = { ...DEFAULT_CONFIG, ...s.data() }; if (onConfigChange) onConfigChange(_cache.config); } });
}

const _ready = _init();

// ── Helpers internos ──────────────────────────────────────────────
async function _saveGifts()  { await setDoc(REF_GIFTS,  { list: _cache.gifts  }); }
async function _saveGuests() { await setDoc(REF_GUESTS, { list: _cache.guests }); }
async function _saveConfig() { await setDoc(REF_CONFIG, _cache.config);           }

// ── Upload de imagem para o Firebase Storage ──────────────────────
// Recebe base64 (data:image/...;base64,...) e devolve a URL pública
async function uploadGiftImage(base64, giftId) {
  if (!base64 || !base64.startsWith('data:')) return base64; // já é URL
  const fileRef = sRef(storage, `gifts/${giftId}_${Date.now()}.jpg`);
  await uploadString(fileRef, base64, 'data_url');
  return await getDownloadURL(fileRef);
}

// ══════════════════════════════════════════════════════════════════
//  API PÚBLICA
// ══════════════════════════════════════════════════════════════════

function getGifts()  { return _cache.gifts  || []; }
function getGuests() { return _cache.guests || []; }
function getConfig() { return _cache.config || { ...DEFAULT_CONFIG }; }
function getGift(id) { return (_cache.gifts || []).find(g => g.id === id) || null; }

async function saveGift(gift) {
  await _ready;

  // Se tiver imagem base64 nova, faz upload e substitui pelo URL
  if (gift.image && gift.image.startsWith('data:')) {
    const giftId = gift.id || Date.now();
    gift.image = await uploadGiftImage(gift.image, giftId);
  }

  const idx = _cache.gifts.findIndex(g => g.id === gift.id);
  if (idx > -1) {
    _cache.gifts[idx] = gift;
  } else {
    gift.id = Date.now();
    _cache.gifts.push(gift);
  }
  await _saveGifts();
}

async function deleteGift(id) {
  await _ready;
  _cache.gifts = _cache.gifts.filter(g => g.id !== id);
  await _saveGifts();
}

async function markGiftChosen(id, chosenBy) {
  await _ready;
  const g = _cache.gifts.find(g => g.id === id);
  if (g) { g.chosen = true; g.chosenBy = chosenBy; }
  await _saveGifts();
}

async function addGuest(guest) {
  await _ready;
  guest.id = Date.now();
  guest.ts = new Date().toISOString();
  _cache.guests.push(guest);
  await _saveGuests();
}

async function deleteGuest(id) {
  await _ready;
  _cache.guests = _cache.guests.filter(g => g.id !== id);
  await _saveGuests();
}

async function dbSaveConfig(config) {
  await _ready;
  _cache.config = config;
  await _saveConfig();
}

// ── Auth ──────────────────────────────────────────────────────────
function checkLogin(user, pass) {
  const c = getConfig();
  return user === c.adminUser && pass === c.adminPass;
}
function isAdminLoggedIn()  { return sessionStorage.getItem('luisa_admin') === 'true'; }
function setAdminLoggedIn(v) {
  if (v) sessionStorage.setItem('luisa_admin', 'true');
  else   sessionStorage.removeItem('luisa_admin');
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Moeda ─────────────────────────────────────────────────────────
function brl(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

// ── Gerador de código PIX (padrão EMV / Copia e Cola) ────────────
function gerarPixCopiaCola(valor) {
  const cfg    = getConfig();
  const chave  = cfg.pixKey   || '';
  const nome   = (cfg.pixOwner || 'LUISA FESTA').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 25);
  const cidade = (cfg.pixCity  || 'BRASIL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 15);
  const valor_ = Number(valor).toFixed(2);

  function campo(id, val) {
    return id + val.length.toString().padStart(2, '0') + val;
  }

  const gui     = campo('00', 'BR.GOV.BCB.PIX') + campo('01', chave);
  const mai     = campo('26', gui);
  const txVal   = campo('54', valor_);
  const addData = campo('62', campo('05', 'luisafesta'));

  const payload =
    campo('00', '01') + mai +
    campo('52', '0000') + campo('53', '986') +
    txVal + campo('58', 'BR') +
    campo('59', nome) + campo('60', cidade) +
    addData + '6304';

  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  return payload + crc16(payload);
}

// ── Exporta para window ───────────────────────────────────────────
Object.assign(window, {
  getGifts, getGift, saveGift, deleteGift, markGiftChosen,
  getGuests, addGuest, deleteGuest,
  getConfig, dbSaveConfig,
  checkLogin, isAdminLoggedIn, setAdminLoggedIn,
  showToast, brl, gerarPixCopiaCola,
  dbReady: _ready,
  dbListenRealtime: _listenRealtime,
});
