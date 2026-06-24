/**
 * data.js — camada de dados via Firebase Firestore
 * Mantém a mesma API pública do localStorage para compatibilidade total.
 *
 * Estrutura no Firestore:
 *   luisa_db/config        → documento com campos de configuração
 *   luisa_db/gifts_meta    → documento com array "list" de presentes
 *   luisa_db/guests_meta   → documento com array "list" de convidados
 */

// ── Firebase SDK (via CDN ESM) ────────────────────────────────────
import { initializeApp }              from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc,
         setDoc, onSnapshot }         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ── Referências dos documentos ────────────────────────────────────
const REF_CONFIG = doc(db, "luisa_db", "config");
const REF_GIFTS  = doc(db, "luisa_db", "gifts_meta");
const REF_GUESTS = doc(db, "luisa_db", "guests_meta");

// ── Dados padrão (usados na 1ª inicialização) ─────────────────────
const DEFAULT_CONFIG = {
  partyDate:    '20 de Julho de 2025',
  partyTime:    '14h00',
  partyPlace:   'A definir',
  pixKey:       '',
  pixOwner:     '',
  pixKeyType:   'celular',
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

// ── Cache local (evita leituras desnecessárias ao Firestore) ───────
let _cache = {
  config: null,
  gifts:  null,
  guests: null,
};

// ── Inicialização: popula Firestore se ainda vazio ─────────────────
async function _init() {
  // Config
  const cfgSnap = await getDoc(REF_CONFIG);
  if (!cfgSnap.exists()) {
    await setDoc(REF_CONFIG, DEFAULT_CONFIG);
    _cache.config = { ...DEFAULT_CONFIG };
  } else {
    _cache.config = { ...DEFAULT_CONFIG, ...cfgSnap.data() };
  }

  // Gifts
  const giftsSnap = await getDoc(REF_GIFTS);
  if (!giftsSnap.exists()) {
    await setDoc(REF_GIFTS, { list: DEFAULT_GIFTS });
    _cache.gifts = [...DEFAULT_GIFTS];
  } else {
    _cache.gifts = giftsSnap.data().list || [];
  }

  // Guests
  const guestsSnap = await getDoc(REF_GUESTS);
  if (!guestsSnap.exists()) {
    await setDoc(REF_GUESTS, { list: [] });
    _cache.guests = [];
  } else {
    _cache.guests = guestsSnap.data().list || [];
  }
}

// ── Escuta em tempo real (atualiza a UI quando outro usuário muda algo) ──
function _listenRealtime(onGiftsChange, onGuestsChange, onConfigChange) {
  onSnapshot(REF_GIFTS, snap => {
    if (snap.exists()) {
      _cache.gifts = snap.data().list || [];
      if (onGiftsChange) onGiftsChange(_cache.gifts);
    }
  });
  onSnapshot(REF_GUESTS, snap => {
    if (snap.exists()) {
      _cache.guests = snap.data().list || [];
      if (onGuestsChange) onGuestsChange(_cache.guests);
    }
  });
  onSnapshot(REF_CONFIG, snap => {
    if (snap.exists()) {
      _cache.config = { ...DEFAULT_CONFIG, ...snap.data() };
      if (onConfigChange) onConfigChange(_cache.config);
    }
  });
}

// ── Promise de inicialização (aguardada pelas funções abaixo) ──────
const _ready = _init();

// ── Helpers internos ──────────────────────────────────────────────
async function _saveGifts()  { await setDoc(REF_GIFTS,  { list: _cache.gifts  }); }
async function _saveGuests() { await setDoc(REF_GUESTS, { list: _cache.guests }); }
async function _saveConfig() { await setDoc(REF_CONFIG, _cache.config);           }

// ══════════════════════════════════════════════════════════════════
//  API PÚBLICA — mesma interface do data.js original
// ══════════════════════════════════════════════════════════════════

// ── Gifts ─────────────────────────────────────────────────────────
function getGifts()  { return _cache.gifts  || []; }
function getGuests() { return _cache.guests || []; }
function getConfig() { return _cache.config || { ...DEFAULT_CONFIG }; }

function getGift(id) {
  return (_cache.gifts || []).find(g => g.id === id) || null;
}

async function saveGift(gift) {
  await _ready;
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

// ── Guests ────────────────────────────────────────────────────────
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

// ── Config ────────────────────────────────────────────────────────
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

function isAdminLoggedIn() {
  return sessionStorage.getItem('luisa_admin') === 'true';
}
function setAdminLoggedIn(v) {
  if (v) sessionStorage.setItem('luisa_admin', 'true');
  else   sessionStorage.removeItem('luisa_admin');
}

// ── Toast helper ──────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Formatação de moeda ───────────────────────────────────────────
function brl(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

// ── Exporta para window (acesso global nos scripts inline dos HTMLs) ─
Object.assign(window, {
  getGifts, getGift, saveGift, deleteGift, markGiftChosen,
  getGuests, addGuest, deleteGuest,
  getConfig, dbSaveConfig,
  checkLogin, isAdminLoggedIn, setAdminLoggedIn,
  showToast, brl,
  // expõe _ready e _listenRealtime para os HTMLs usarem
  dbReady: _ready,
  dbListenRealtime: _listenRealtime,
});
