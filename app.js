'use strict';
/* Klávesová mise – Klik a školní výlet
   Příběh: simulovaný textový editor, ve kterém děti označují text myší,
   klikají na místo vložení a mačkají zkratky. Správně = krok vpřed,
   špatná zkratka = krok zpět (dokument se vrátí do předchozího stavu). */

const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));
const rand = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- Zkratky ---------- */
const SC = {
  c: { label: 'Ctrl + C', name: 'Kopírovat', does: 'kopíruje', icon: '📋', hook: 'C jako Copy' },
  v: { label: 'Ctrl + V', name: 'Vložit', does: 'vkládá ze schránky', icon: '📥', hook: 'V je hned vedle C' },
  x: { label: 'Ctrl + X', name: 'Vyjmout', does: 'vyjímá text', icon: '✂️', hook: 'X vypadá jako nůžky' },
  a: { label: 'Ctrl + A', name: 'Označit vše', does: 'označí úplně všechno', icon: '🔲', hook: 'A jako All (vše)' },
  z: { label: 'Ctrl + Z', name: 'Zpět', does: 'vrací poslední změnu', icon: '↩️', hook: 'Z jako Zpět' },
  y: { label: 'Ctrl + Y', name: 'Znovu', does: 'vrací zpátky to, co jsi vrátil', icon: '↪️', hook: 'Y je opak Z' },
  s: { label: 'Ctrl + S', name: 'Uložit', does: 'ukládá dokument', icon: '💾', hook: 'S jako Save (uložit)' },
  f: { label: 'Ctrl + F', name: 'Najít', does: 'hledá v textu', icon: '🔍', hook: 'F jako Find (najít)' },
  b: { label: 'Ctrl + B', name: 'Tučně', does: 'dělá tučné písmo', icon: 'B', hook: 'B jako Bold (tučně)' },
  i: { label: 'Ctrl + I', name: 'Kurzíva', does: 'dělá kurzívu', icon: 'I', hook: 'I jako Italic (kurzíva)' },
  u: { label: 'Ctrl + U', name: 'Podtrhnout', does: 'podtrhuje', icon: 'U', hook: 'U jako Underline' },
  p: { label: 'Ctrl + P', name: 'Tisk', does: 'tiskne', icon: '🖨️', hook: 'P jako Print (tisk)' }
};
const ORDER = ['c', 'v', 'x', 'a', 'z', 'y', 's', 'f', 'b', 'i', 'u', 'p'];
const TOOLBAR = [['b', 'i', 'u'], ['x', 'c', 'v'], ['z', 'y'], ['f', 's', 'p']];

/* ---------- Pomocníci pro dokumenty ---------- */
const blk = (tag, ...parts) => ({ tag, parts: parts.map(p => typeof p === 'string' ? { text: p } : p) });
const H = (...p) => blk('h', ...p);
const P = (...p) => blk('p', ...p);
const docText = doc => doc.map(b => b.parts.map(p => p.text || '').join('')).join('\n');

const REFERAT = () => [
  H('Hrad Karlštejn'),
  P('Hrad Karlštejn nechal postavit císař Karel IV. Sloužil hlavně jako bezpečné místo pro korunovační klenoty a vzácné relikvie.'),
  P('Nejcennější místností hradu je ', { id: 'kaple', text: 'kaple svatého Kříže' }, '. Její stěny zdobí víc než sto obrazů od mistra Theodorika a tisíce drahých kamenů.'),
  P('Na hrad se chodí pěšky z vesnice pod ním. Cesta trvá asi dvacet minut a vede pořád do kopce, tak si vezměte pohodlné boty.'),
  P('Napsal: Ondra Svoboda, 7.B')
];

/* ---------- Příběh ---------- */
const CHAPTERS = [
  {
    title: 'Pozvánka na výlet', emoji: '✉️', file: 'pozvanka.docx',
    intro: 'Ahoj, já jsem Klik – počítačová myš ze školní počítačovky. Třída 7.B jede v pátek na výlet na Karlštejn, jenže v dokumentech je hrozný zmatek. Myší to sám nestihnu, ale ty umíš klávesové zkratky. Pomůžeš mi? Začneme pozvánkou.',
    outro: 'Pozvánka visí na nástěnce a všichni už vědí, kde je sraz. Jdeme dál!',
    doc: () => [
      H({ id: 'nadpis', text: 'Pozvánka na výlet' }),
      P('Milí spolužáci, v pátek jedeme na hrad Karlštejn!'),
      P('Vlak odjíždí v 7:45 z ', { id: 'misto', text: 'hlavního nádraží' }, '.'),
      P('Sraz je v 7:30 před budovou ', { id: 's1', slot: true }, '.'),
      P('S sebou: svačinu, pití a dobrou náladu.'),
      P('Těší se na vás třída 7.B a paní učitelka Nováková')
    ],
    steps: [
      { type: 'select', target: 'nadpis', say: 'Nadpis vypadá jako obyčejná věta. Nejdřív ho označ myší – táhni přes „Pozvánka na výlet“.' },
      { type: 'key', key: 'b', say: 'Výborně, je označený! Teď z něj udělej tučné písmo.' },
      { type: 'select', target: 'misto', say: 'Ve větě o srazu chybí, kde se sejdeme. Označ ve třetím řádku slova „hlavního nádraží“.' },
      { type: 'key', key: 'c', say: 'Zkopíruj je. Původní text musí zůstat na svém místě.' },
      { type: 'click', target: 's1', say: 'Teď klikni na blikající rámeček ve větě o srazu.' },
      { type: 'key', key: 'v', say: 'Kurzor je na místě. Vlož sem, co máš ve schránce.' },
      { type: 'key', key: 's', say: 'Pozvánka je hotová! Ulož ji, ať o ni nepřijdeme.' }
    ]
  },
  {
    title: 'Co si zabalit', emoji: '🎒', file: 'co-si-zabalit.docx',
    intro: 'Paní učitelka sepsala, co si vzít s sebou. Jenže se jí do seznamu vloudila chyba… A já mám dneska rýmu. Hlavně ať nekýchnu na klávesnici!',
    outro: 'Seznam je v pořádku a pláštěnka zachráněna. Kdyby pršelo, nikdo nezmokne!',
    doc: () => [
      H('Co si zabalit na výlet'),
      P({ id: 'urcite', text: 'Určitě s sebou:' }),
      P('• svačinu a pití'),
      P('• ', { id: 'plast', text: 'pláštěnku' }),
      P('• ', { id: 'plavky', text: 'plavky' }),
      P('• pohodlné boty'),
      P('Nechat doma:'),
      P('• tablet, ', { id: 's2', slot: true })
    ],
    steps: [
      { type: 'select', target: 'plavky', say: 'Počkej… plavky? Na hrad? Ty patří k věcem, které necháme doma. Označ slovo „plavky“.' },
      { type: 'key', key: 'x', say: 'Teď je vyjmi. Ze seznamu zmizí a schovají se do schránky.' },
      { type: 'click', target: 's2', say: 'Klikni na blikající rámeček u „Nechat doma“.' },
      { type: 'key', key: 'v', say: 'A vlož je tam.' },
      { type: 'key', key: 'z', pre: g => { edit(g); removeBlockWith(g, 'plast'); }, mood: 'wow', shake: true,
        say: 'Hep… HEPČÍ! 🤧 Jejda, kýchl jsem na klávesnici a smazal pláštěnku! Vrať tu poslední změnu zpátky!' },
      { type: 'select', target: 'urcite', say: 'Uf, pláštěnka je zpátky. Ještě označ nadpis seznamu „Určitě s sebou:“.' },
      { type: 'key', key: 'u', say: 'Podtrhni ho, ať je jasné, kde seznam začíná.' },
      { type: 'key', key: 's', say: 'Hotovo. Ulož seznam!' }
    ]
  },
  {
    title: 'Bábovka na jarmark', emoji: '🍰', file: 'babovka.docx',
    intro: 'Na výlet potřebujeme peníze, takže ve čtvrtek pečeme na školní jarmark. Babička od Terky poslala svůj slavný recept – jen vypadá dost nudně. Vyzdobíme ho!',
    outro: 'Recept je krásný a bábovky se prodaly za pět minut. Na výlet máme!',
    doc: () => [
      H({ id: 'rh', text: 'Babiččina bábovka' }),
      P('Na školní jarmark upečeme bábovku. Peníze půjdou na výlet.'),
      P('Suroviny: 4 vejce, 250 g cukru, 250 g polohrubé mouky, prášek do pečiva, 125 ml mléka, 125 ml oleje a 2 lžíce kakaa.'),
      P('Postup: Vejce utři s cukrem do pěny, přimíchej mléko a olej, nakonec mouku s práškem. Polovinu těsta obarvi kakaem a peč asi 50 minut na 170 °C.'),
      P({ id: 'tip', text: 'Tip od babičky: Nikdy neotvírej troubu dřív než po půl hodině!' })
    ],
    steps: [
      { type: 'select', target: 'rh', say: 'Začneme nadpisem. Označ „Babiččina bábovka“.' },
      { type: 'key', key: 'u', say: 'Podtrhni ho.' },
      { type: 'key', key: 'b', say: 'A ještě tučně – ať je vidět i z druhého konce jarmarku!' },
      { type: 'select', target: 'tip', say: 'Babiččin tip je moc důležitý. Označ celou poslední větu. (Trik: trojklik označí celý odstavec.)' },
      { type: 'key', key: 'i', say: 'Nastav ji kurzívou.' },
      { type: 'key', key: 'z', mood: 'think', say: 'Hmm… vlastně se mi ta kurzíva nelíbí. Vrať tu změnu.' },
      { type: 'key', key: 'y', mood: 'wow', say: 'Ne, počkej! Bylo to hezčí. Vrať kurzívu zase zpátky.' },
      { type: 'key', key: 's', say: 'Babička bude pyšná. Ulož recept.' }
    ]
  },
  {
    title: 'Referát o Karlštejně', emoji: '🏰', file: 'referat-karlstejn.docx',
    intro: 'Ondra napsal do školních novin referát o Karlštejně. Paní učitelka chce, aby v něm byla zvýrazněná nejvzácnější místnost hradu. Text je dlouhý, tak na to půjdeme chytře.',
    outro: 'Referát je hotový a zkopírovaný ve schránce. Teď ho jen dostat do novin!',
    doc: REFERAT,
    steps: [
      { type: 'key', key: 'f', say: 'Hledat očima je pomalé. Otevři vyhledávání v dokumentu.' },
      { type: 'type', target: 'kaple', say: 'Do pole hledání nahoře napiš slovo „kaple“.' },
      { type: 'select', target: 'kaple', say: 'Mám to! Označ myší celé „kaple svatého Kříže“.' },
      { type: 'key', key: 'b', say: 'Zvýrazni to tučně.' },
      { type: 'key', key: 'a', say: 'Referát je hotový. Teď ho přeneseme do novin – označ celý dokument najednou.' },
      { type: 'key', key: 'c', say: 'Všechno svítí modře. Zkopíruj to!' },
      { type: 'key', key: 's', say: 'A pro jistotu ulož.' }
    ]
  },
  {
    title: 'Školní noviny', emoji: '📰', file: 'noviny-7B.docx',
    intro: 'Poslední úkol! Do zítřka musí být hotové noviny 7.B. Referát máme ve schránce, stačí ho vložit, vyladit titulek a všechno vytisknout.',
    outro: 'Noviny voní tiskárnou, pozvánka visí, bábovky jsou snědené a v pátek se jede na Karlštejn!',
    clip: () => docText(REFERAT()),
    doc: () => [
      H({ id: 'nn', text: 'Noviny 7.B' }),
      P('Jarní vydání · píše a kreslí celá třída'),
      { tag: 'p', cls: 'boxed', parts: [{ id: 's5', slot: true, ph: 'sem patří referát' }] },
      P('Na jarmarku jsme vybrali 4 280 Kč. Díky všem, kdo upekli bábovku!'),
      P('Hádanka: Co má klávesy, ale neodemkne žádné dveře?')
    ],
    steps: [
      { type: 'click', target: 's5', say: 'Referát máme ve schránce. Klikni do prázdného rámečku uprostřed stránky.' },
      { type: 'key', key: 'v', say: 'Vlož ho tam!' },
      { type: 'select', target: 'nn', say: 'Titulek novin musí být vidět. Označ „Noviny 7.B“.' },
      { type: 'key', key: 'b', say: 'Tučně!' },
      { type: 'key', key: 'u', say: 'A ještě podtrhnout.' },
      { type: 'key', key: 's', say: 'Noviny jsou hotové. Ulož je.' },
      { type: 'key', key: 'p', say: 'Úplně poslední krok: vytiskneme je pro celou třídu!' }
    ]
  }
];

const TASK_TEXT = {
  c: ['Zkopíruj text', 'Stejnou větu chceš použít i jinde, ale tady má zůstat taky.'],
  v: ['Vlož ze schránky', 'Ve schránce máš zkopírovanou adresu. Dej ji do e-mailu.'],
  x: ['Vyjmi text', 'Odstavec je na špatném místě. Chceš ho přesunout jinam.'],
  a: ['Označ všechno', 'Chceš změnit písmo v celém dokumentu najednou.'],
  z: ['Vrať poslední změnu', 'Jejda, celý odstavec najednou zmizel! Rychle ho vrať.'],
  y: ['Zopakuj vrácenou změnu', 'Změnu jsi vrátil zpátky, ale vlastně byla dobrá. Chceš ji obnovit.'],
  s: ['Ulož dokument', 'Píšeš slohovku už hodinu. Ať o ni nepřijdeš!'],
  f: ['Najdi slovo', 'V dlouhém textu hledáš, kde se píše o dinosaurech.'],
  b: ['Tučné písmo', 'Nadpis má být výrazný a silný.'],
  i: ['Kurzíva', 'Název knihy chceš napsat šikmým písmem.'],
  u: ['Podtržení', 'Datum písemky chceš podtrhnout čarou.'],
  p: ['Tisk', 'Referát potřebuješ mít na papíře a odevzdat ho.']
};

const PRAISE = ['Paráda!', 'Výborně!', 'Přesně tak!', 'Jde ti to!', 'Super!', 'Bomba!', 'Jako profík!'];

/* ---------- Uložení postupu (jen v tomto prohlížeči) ---------- */
const STORE_KEY = 'klavesova-mise-v2';
function load() { try { return Object.assign({ stars: [0, 0, 0, 0, 0], best: null, sound: true }, JSON.parse(localStorage.getItem(STORE_KEY)) || {}); } catch { return { stars: [0, 0, 0, 0, 0], best: null, sound: true }; } }
const data = load();
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* bez úložiště se hraje dál */ } }

/* ---------- Zvuky ---------- */
let actx = null;
function tone(f, d, type = 'sine', when = 0, vol = 0.07) {
  if (!data.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + when;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
  } catch { /* zvuk není nutný */ }
}
const sfx = {
  good() { tone(660, 0.12, 'triangle'); tone(990, 0.2, 'triangle', 0.08); },
  bad() { tone(240, 0.22, 'square', 0, 0.04); tone(170, 0.3, 'square', 0.12, 0.04); },
  tick() { tone(520, 0.05, 'triangle', 0, 0.04); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', i * 0.12)); },
  print() { for (let i = 0; i < 8; i++) tone(180 + (i % 2) * 40, 0.08, 'sawtooth', i * 0.14, 0.02); }
};

/* ---------- Klik (SVG postavička) ---------- */
function klikSVG() {
  return `<svg class="klik" data-mood="happy" viewBox="0 0 140 175" aria-hidden="true">
  <path class="klik-cable" d="M70 22 C70 2 98 2 110 12 S128 30 136 14" fill="none" stroke="#6c4cff" stroke-width="5" stroke-linecap="round"/>
  <g class="klik-body">
    <ellipse cx="70" cy="168" rx="38" ry="5" fill="#2a225922"/>
    <rect x="22" y="20" width="96" height="140" rx="48" fill="#fff" stroke="#2a2259" stroke-width="5"/>
    <path d="M24 70 H116 M70 22 V70" stroke="#2a2259" stroke-width="4" fill="none"/>
    <rect x="63" y="33" width="14" height="25" rx="7" fill="#7c5cff" stroke="#2a2259" stroke-width="3"/>
    <g class="klik-eyes"><ellipse cx="52" cy="100" rx="7" ry="9" fill="#2a2259"/><ellipse cx="88" cy="100" rx="7" ry="9" fill="#2a2259"/><circle cx="54.5" cy="96.5" r="2.6" fill="#fff"/><circle cx="90.5" cy="96.5" r="2.6" fill="#fff"/></g>
    <ellipse cx="39" cy="118" rx="8" ry="5" fill="#ffb3c7"/><ellipse cx="101" cy="118" rx="8" ry="5" fill="#ffb3c7"/>
    <path class="m m-happy" d="M56 119 Q70 134 84 119" fill="none" stroke="#2a2259" stroke-width="4" stroke-linecap="round"/>
    <path class="m m-sad" d="M57 131 Q70 119 83 131" fill="none" stroke="#2a2259" stroke-width="4" stroke-linecap="round"/>
    <ellipse class="m m-wow" cx="70" cy="126" rx="6" ry="8" fill="#2a2259"/>
    <path class="m m-think" d="M58 126 H82" stroke="#2a2259" stroke-width="4" stroke-linecap="round"/>
  </g></svg>`;
}
let moodTimer = null;
function setMood(m, ms = 1600) {
  document.querySelectorAll('.klik').forEach(k => { k.dataset.mood = m; });
  clearTimeout(moodTimer);
  if (m !== 'happy' && ms) moodTimer = setTimeout(() => setMood('happy'), ms);
}

/* ---------- Efekty ---------- */
const COLORS = ['#6c4cff', '#ffc93c', '#22c08a', '#ff5d6c', '#4cc3ff', '#ff8fd1'];
function burst(x, y, n = 22, spread = 110) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.className = 'confetti';
    const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * spread;
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = rand(COLORS);
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d - 50 + 'px');
    s.style.setProperty('--r', Math.random() * 720 + 'deg');
    document.body.append(s);
    setTimeout(() => s.remove(), 1100);
  }
}
function burstAt(el, n, spread) { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n, spread); }
function rain() { for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * 0.3, 26, 160), i * 180); }
function anim(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function floatText(el, text, cls = '') {
  if (!el) return;
  const r = el.getBoundingClientRect(), f = document.createElement('div');
  f.className = 'float-text ' + cls; f.textContent = text;
  f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px';
  document.body.append(f); setTimeout(() => f.remove(), 1100);
}

/* ---------- Obrazovky ---------- */
let screen = 'home';
function show(id) {
  screen = id;
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== id));
  window.scrollTo({ top: 0 });
  setVctrl(false);
}

/* ---------- Klávesnice na obrazovce ---------- */
const KB_ROWS = [['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], ['shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm'], ['ctrl', 'space']];
let vctrl = false;
function buildKeyboards() {
  document.querySelectorAll('[data-kb]').forEach(kb => {
    kb.replaceChildren(...KB_ROWS.map(row => {
      const r = document.createElement('div'); r.className = 'kb-row';
      for (const k of row) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'key k-' + k; b.dataset.k = k; b.tabIndex = -1;
        b.textContent = k === 'ctrl' ? 'Ctrl' : k === 'shift' ? '⇧ Shift' : k === 'space' ? '' : k.toUpperCase();
        if (k === 'ctrl') b.setAttribute('aria-pressed', 'false');
        b.addEventListener('mousedown', e => e.preventDefault());
        b.addEventListener('click', () => onScreenKey(k));
        r.append(b);
      }
      return r;
    }));
  });
}
function keysOf(k) { return document.querySelectorAll(`.kb [data-k="${k}"]`); }
function kbCtrl(on) { keysOf('ctrl').forEach(b => b.classList.toggle('down', on || vctrl)); }
function setVctrl(on) {
  vctrl = on;
  keysOf('ctrl').forEach(b => { b.classList.toggle('down', on); b.classList.toggle('sticky', on); b.setAttribute('aria-pressed', String(on)); });
}
function kbFlash(k, result) {
  keysOf(k).forEach(b => {
    b.classList.remove('ok', 'bad', 'plain'); void b.offsetWidth;
    b.classList.add('down', result || 'plain');
    setTimeout(() => b.classList.remove('down', 'ok', 'bad', 'plain'), 450);
  });
}
function kbHint(k) {
  document.querySelectorAll('.kb .hint').forEach(b => b.classList.remove('hint'));
  if (!k) return;
  keysOf(k).forEach(b => b.classList.add('hint'));
  keysOf('ctrl').forEach(b => b.classList.add('hint'));
}
function onScreenKey(k) {
  if (k === 'ctrl') { setVctrl(!vctrl); sfx.tick(); notice(vctrl ? 'Ctrl je zapnutý – teď zmáčkni písmeno.' : 'Ctrl vypnutý.', 'info'); return; }
  if (k === 'shift' || k === 'space') return;
  if (vctrl) { setVctrl(false); shortcut(k, false); }
  else { kbFlash(k); notice('Samotné písmeno nestačí – nejdřív Ctrl!', 'info'); }
}

/* ---------- Vstup z klávesnice ---------- */
function keyLetter(e) {
  const k = (e.key || '').toLowerCase();
  if (/^[a-z]$/.test(k)) return k;
  if (e.code && /^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase();
  return null;
}
function onKeyDown(e) {
  if (e.key === 'Control' || e.key === 'Meta') { kbCtrl(true); return; }
  if (screen !== 'story' && screen !== 'train') return;
  const realMod = e.ctrlKey || e.metaKey;
  if (screen === 'story' && e.target === $('searchInput') && !realMod) return; // psaní do hledání
  const k = keyLetter(e);
  if (!k) return;
  if (realMod || vctrl) {
    e.preventDefault();
    if (e.repeat) return;
    setVctrl(false);
    shortcut(k, e.shiftKey || e.altKey);
  } else if (!(e.target instanceof HTMLInputElement)) {
    kbFlash(k);
    notice('Drž klávesu Ctrl a k tomu zmáčkni písmeno. (Na Macu ⌘.)', 'info');
  }
}
function shortcut(k, extra) {
  if (screen === 'story') storyKey(k, extra);
  else if (screen === 'train') trainKey(k, extra);
}
function notice(text, kind) {
  const el = screen === 'train' ? $('tFeedback') : $('storyFeedback');
  if (!el) return;
  el.textContent = text; el.className = 'feedback ' + (kind || '');
  anim(el, 'pop-in');
}
function wrongText(k) {
  return SC[k] ? `${SC[k].label} ${SC[k].does}.` : `Ctrl + ${k.toUpperCase()} tady nic neudělá.`;
}

/* =================================================================
   PŘÍBĚH
   ================================================================= */
const S = { ch: 0, step: 0, g: null, hist: [], mistakes: 0, hints: 0, lock: 0, fresh: null, hintOn: false, typer: null, timers: [] };
const curChapter = () => CHAPTERS[S.ch];
const curStep = () => curChapter().steps[S.step];
const later = (fn, ms) => { const t = setTimeout(fn, ms); S.timers.push(t); return t; };
function clearStoryTimers() { S.timers.forEach(clearTimeout); S.timers = []; clearInterval(S.typer); }

/* --- operace s dokumentem --- */
function edit(g) { g.undo.push(clone(g.doc)); g.redo = []; g.saved = false; }
function findPart(g, id) { for (const b of g.doc) for (const p of b.parts) if (p.id === id) return p; return null; }
function removeBlockWith(g, id) { g.doc = g.doc.filter(b => !b.parts.some(p => p.id === id)); }
function selParts(g) { const out = []; for (const b of g.doc) for (const p of b.parts) if (!p.slot && (g.sel === 'ALL' || (g.sel && p.id === g.sel))) out.push(p); return out; }
function selText(g) { return g.sel === 'ALL' ? docText(g.doc) : (findPart(g, g.sel) || {}).text || ''; }

function applyKey(g, k) {
  switch (k) {
    case 'a': g.sel = 'ALL'; break;
    case 'c': g.clip = selText(g); break;
    case 'x': {
      g.clip = selText(g); edit(g);
      for (const b of g.doc) b.parts = b.parts.filter(p => p.id !== g.sel);
      g.doc = g.doc.filter(b => b.parts.map(p => p.slot ? 'x' : p.text).join('').replace('•', '').trim() !== '');
      g.sel = null; break;
    }
    case 'v': {
      edit(g);
      const slot = findPart(g, g.cursor);
      if (slot) { delete slot.slot; delete slot.ph; slot.text = g.clip; slot.pasted = true; S.fresh = slot.id; }
      g.cursor = null; break;
    }
    case 'b': case 'i': case 'u': {
      edit(g);
      const parts = selParts(g), on = !parts.every(p => p[k]);
      parts.forEach(p => { p[k] = on; });
      break;
    }
    case 'z': if (g.undo.length) { g.redo.push(clone(g.doc)); g.doc = g.undo.pop(); g.saved = false; } break;
    case 'y': if (g.redo.length) { g.undo.push(clone(g.doc)); g.doc = g.redo.pop(); g.saved = false; } break;
    case 's': g.saved = true; break;
    case 'f': g.search = { open: true, query: '', found: null }; break;
  }
}

/* --- vykreslení --- */
function renderToolbar() {
  const tb = $('toolbar');
  tb.replaceChildren(...TOOLBAR.map(group => {
    const g = document.createElement('div'); g.className = 'tb-group';
    for (const k of group) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tb tb-' + k; b.dataset.k = k; b.title = SC[k].name; b.tabIndex = -1;
      b.textContent = SC[k].icon;
      b.addEventListener('mousedown', e => e.preventDefault());
      b.addEventListener('click', () => { setMood('think'); notice('Myší by to šlo taky – ale my trénujeme zkratky! 😉', 'info'); });
      g.append(b);
    }
    return g;
  }));
}
function fillText(el, text, q) {
  if (!q) { el.textContent = text; return; }
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  for (const piece of text.split(re)) {
    if (!piece) continue;
    if (piece.toLowerCase() === q.toLowerCase()) { const m = document.createElement('mark'); m.textContent = piece; el.append(m); }
    else el.append(document.createTextNode(piece));
  }
}
function renderPaper() {
  const g = S.g, step = curStep(), paper = $('paper');
  paper.replaceChildren();
  for (const b of g.doc) {
    const el = document.createElement(b.tag === 'h' ? 'h3' : 'p');
    el.className = 'blk ' + (b.cls || '');
    for (const p of b.parts) {
      const sp = document.createElement('span');
      if (p.id) sp.dataset.id = p.id;
      if (p.slot) {
        sp.className = 'slot';
        const isTarget = step && step.type === 'click' && step.target === p.id;
        if (g.cursor === p.id) { sp.classList.add('caret'); sp.textContent = '​'; }
        else { sp.textContent = isTarget ? (p.ph || 'klikni sem') : ' '; if (isTarget) sp.classList.add('blink'); }
        sp.addEventListener('click', e => { e.stopPropagation(); onSlotClick(p.id); });
      } else {
        sp.className = 'part';
        if (p.b) sp.classList.add('fb');
        if (p.i) sp.classList.add('fi');
        if (p.u) sp.classList.add('fu');
        if (p.pasted) sp.classList.add('pasted');
        if (g.sel === 'ALL' || (g.sel && g.sel === p.id)) sp.classList.add('sel');
        if (S.hintOn && step && step.type === 'select' && step.target === p.id) sp.classList.add('hint-target');
        if (S.fresh === p.id) sp.classList.add('fresh');
        fillText(sp, p.text, g.search.found);
      }
      el.append(sp);
    }
    paper.append(el);
  }
  S.fresh = null;
}
function renderChrome() {
  const g = S.g;
  $('fileName').textContent = curChapter().file;
  $('dirty').classList.toggle('on', !g.saved);
  $('clipText').textContent = g.clip ? '„' + (g.clip.length > 60 ? g.clip.slice(0, 58).replace(/\n/g, ' ') + '…' : g.clip.replace(/\n/g, ' ')) + '“' : 'prázdná';
  $('clipboard').classList.toggle('empty', !g.clip);
  const sb = $('searchBar');
  sb.classList.toggle('hidden', !g.search.open);
  if ($('searchInput').value !== g.search.query) $('searchInput').value = g.search.query;
  $('stMistakes').textContent = S.mistakes;
  $('stHints').textContent = S.hints;
}
function renderTrack() {
  const n = curChapter().steps.length, tr = $('track');
  if (tr.dataset.ch !== String(S.ch)) {
    tr.dataset.ch = S.ch; tr.replaceChildren();
    const line = document.createElement('div'); line.className = 'track-line'; tr.append(line);
    const fill = document.createElement('div'); fill.className = 'track-fill'; fill.id = 'trackFill'; tr.append(fill);
    for (let i = 0; i <= n; i++) {
      const s = document.createElement('div');
      s.className = 'stone' + (i === n ? ' goal' : '');
      s.textContent = i === n ? '🏁' : String(i + 1);
      tr.append(s);
    }
    const runner = document.createElement('div'); runner.className = 'runner'; runner.id = 'runner'; runner.innerHTML = klikSVG(); tr.append(runner);
  }
  const stones = tr.querySelectorAll('.stone');
  stones.forEach((s, i) => { s.classList.toggle('done', i < S.step); s.classList.toggle('current', i === S.step); });
  requestAnimationFrame(placeRunner);
  const pills = $('chapterPills');
  pills.replaceChildren(...CHAPTERS.map((c, i) => {
    const p = document.createElement('span');
    p.className = 'cpill' + (i < S.ch ? ' done' : i === S.ch ? ' current' : '');
    p.innerHTML = `<b>${i < S.ch ? '✓' : c.emoji}</b><span>${i + 1}. ${c.title}</span>`;
    return p;
  }));
}
function placeRunner() {
  const tr = $('track'), stones = tr.querySelectorAll('.stone'), s = stones[S.step], r = $('runner');
  if (!s || !r) return;
  const x = s.offsetLeft + s.offsetWidth / 2;
  r.style.left = x + 'px';
  const first = stones[0];
  $('trackFill').style.width = Math.max(0, x - (first.offsetLeft + first.offsetWidth / 2)) + 'px';
}
const TYPE_CHIP = {
  select: ['🖱️', 'Označ text myší', 'Táhni myší přes text, nebo na slovo dvakrát klikni.'],
  click: ['👆', 'Klikni do textu', 'Klikni na blikající rámeček.'],
  key: ['⌨️', 'Zmáčkni zkratku', 'Drž Ctrl a zmáčkni správné písmeno.'],
  type: ['✍️', 'Napiš slovo', 'Piš normálně, bez Ctrl.']
};
function renderChip() {
  const t = TYPE_CHIP[curStep().type];
  $('taskChip').innerHTML = `<span class="chip-ico">${t[0]}</span><div><b>${t[1]}</b><small>${t[2]}</small></div><span class="chip-step">krok ${S.step + 1}/${curChapter().steps.length}</span>`;
  $('taskChip').dataset.type = curStep().type;
  anim($('taskChip'), 'pop-in');
}
function renderStory() { renderPaper(); renderChrome(); renderTrack(); renderChip(); }

function say(text, mood) {
  clearInterval(S.typer);
  const el = $('say'); el.textContent = ''; el.setAttribute('aria-label', text);
  let i = 0;
  S.typer = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(S.typer); }, 16);
  if (mood) setMood(mood, 2400);
}

/* --- průběh kapitoly --- */
function openChapter(ch) {
  clearStoryTimers();
  S.ch = ch;
  const c = curChapter();
  $('introNum').textContent = `Kapitola ${ch + 1} z ${CHAPTERS.length}`;
  $('introEmoji').textContent = c.emoji;
  $('introTitle').textContent = c.title;
  $('introText').textContent = c.intro;
  show('intro');
  $('introGo').focus();
}
function beginChapter() {
  clearStoryTimers();
  const c = curChapter();
  S.g = { doc: c.doc(), sel: null, cursor: null, clip: c.clip ? c.clip() : '', undo: [], redo: [], saved: true, search: { open: false, query: '', found: null } };
  S.step = 0; S.hist = []; S.mistakes = 0; S.hints = 0; S.lock = 0;
  $('track').dataset.ch = '';
  $('storyFeedback').textContent = ''; $('storyFeedback').className = 'feedback';
  $('printer').classList.add('hidden');
  show('story');
  enterStep(0);
}
function enterStep(i) {
  S.step = i; S.hintOn = false; kbHint(null);
  const c = curChapter();
  if (i >= c.steps.length) { chapterComplete(); return; }
  const st = c.steps[i];
  if (st.pre) st.pre(S.g);
  S.hist[i] = clone(S.g);
  renderStory();
  say(st.say, st.mood);
  if (st.shake) { anim($('editor'), 'quake'); sfx.bad(); }
  if (st.type === 'type') later(() => $('searchInput').focus(), 50);
}
function stepSuccess(origin) {
  sfx.good();
  S.lock = Date.now() + 750;
  const praise = rand(PRAISE);
  notice('✓ ' + praise, 'good');
  floatText(origin || $('runner'), '✓ ' + praise, 'good');
  burstAt($('runner'), 14, 70);
  setMood('happy');
  const last = S.step + 1 >= curChapter().steps.length;
  if (curStep().key === 'p') { later(() => enterStep(S.step + 1), 2800); return; }
  later(() => enterStep(S.step + 1), last ? 900 : 650);
}
function stepFail(msg) {
  sfx.bad();
  S.mistakes++;
  S.lock = Date.now() + 700;
  setMood('sad', 2200);
  anim($('track'), 'shake');
  anim($('editor'), 'shake');
  if (S.step > 0) {
    S.step--;
    S.g = clone(S.hist[S.step]);
    S.hintOn = false; kbHint(null);
    renderStory();
    floatText($('runner'), '−1 krok', 'bad');
    notice(`✗ ${msg} Jdeš o krok zpátky.`, 'bad');
    later(() => say('Nevadí! ' + curStep().say), 50);
  } else {
    renderChrome();
    notice(`✗ ${msg} Zkus to znovu.`, 'bad');
  }
}
function storyKey(k, extra) {
  const st = curStep();
  if (!st || Date.now() < S.lock) return;
  if (st.type !== 'key') {
    kbFlash(k);
    const what = { select: 'Teď ještě žádnou zkratku – nejdřív označ text myší.', click: 'Teď ještě žádnou zkratku – nejdřív klikni na blikající rámeček.', type: 'Teď nepotřebuješ Ctrl – jen napiš slovo do hledání.' }[st.type];
    notice(what, 'info'); setMood('think');
    return;
  }
  if (extra) { kbFlash(k); notice('Bez Shiftu a Altu – jen Ctrl a písmeno.', 'info'); return; }
  if (k === st.key) {
    kbFlash(k, 'ok');
    applyKey(S.g, k);
    keyEffect(k);
    renderPaper(); renderChrome();
    stepSuccess(document.querySelector(`.tb[data-k="${k}"]`));
  } else {
    kbFlash(k, 'bad');
    stepFail(wrongText(k) + ' Tady potřebujeme něco jiného.');
  }
}
function keyEffect(k) {
  const tb = document.querySelector(`.tb[data-k="${k}"]`);
  anim(tb, 'flash');
  if (k === 'c' || k === 'x') anim($('clipboard'), 'bump');
  if (k === 's') { const t = $('toast'); t.textContent = '💾 Uloženo!'; anim(t, 'show'); }
  if (k === 'z' || k === 'y') anim($('paper'), k === 'z' ? 'rewind' : 'forward');
  if (k === 'f') later(() => $('searchInput').focus(), 30);
  if (k === 'p') {
    const pr = $('printer'); pr.classList.remove('hidden'); anim(pr, 'printing'); sfx.print();
    later(() => pr.classList.add('hidden'), 2700);
  }
}
function onSlotClick(id) {
  const st = curStep();
  if (screen !== 'story' || !st || Date.now() < S.lock) return;
  if (st.type === 'click' && st.target === id) {
    S.g.cursor = id;
    renderPaper();
    stepSuccess(document.querySelector(`.slot[data-id="${id}"]`));
  }
}
const norm = s => s.toLowerCase().replace(/\s+/g, ' ').replace(/^[\s.,:;!?„“"()•\-–]+|[\s.,:;!?„“"()•\-–]+$/g, '').trim();
function checkSelection() {
  const st = curStep();
  if (screen !== 'story' || !st || st.type !== 'select' || Date.now() < S.lock) return;
  const sel = window.getSelection();
  const txt = sel ? sel.toString() : '';
  if (!txt.trim() || !$('paper').contains(sel.anchorNode)) return;
  const target = norm(findPart(S.g, st.target).text), got = norm(txt);
  if (got === target || (got.includes(target) && got.length <= target.length + 3)) {
    sel.removeAllRanges();
    S.g.sel = st.target;
    renderPaper();
    stepSuccess(document.querySelector(`.part[data-id="${st.target}"]`));
  } else if (target.includes(got)) {
    notice('Skoro! Ještě kousek – označ celé: „' + findPart(S.g, st.target).text + '“', 'info'); setMood('think');
  } else {
    notice('Tohle není ono. Hledej: „' + findPart(S.g, st.target).text + '“', 'info'); setMood('think');
  }
}
function onSearchInput() {
  const st = curStep();
  S.g.search.query = $('searchInput').value;
  if (screen !== 'story' || !st || st.type !== 'type' || Date.now() < S.lock) return;
  if (norm(S.g.search.query).includes(norm(st.target))) {
    S.g.search.found = st.target;
    $('searchInput').blur();
    renderPaper();
    const m = $('paper').querySelector('mark');
    if (m) m.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    stepSuccess(m || $('searchBar'));
  }
}
function storyHint() {
  const st = curStep();
  if (!st || screen !== 'story') return;
  S.hints++;
  $('stHints').textContent = S.hints;
  if (st.type === 'key') { kbHint(st.key); notice(`💡 Na klávesnici dole svítí správné klávesy: ${SC[st.key].label}.`, 'info'); }
  else if (st.type === 'select') { S.hintOn = true; renderPaper(); notice('💡 Text, který máš označit, je v textu orámovaný. Táhni přes něj myší se zmáčknutým levým tlačítkem.', 'info'); }
  else if (st.type === 'click') { notice('💡 Hledej v dokumentu fialový blikající rámeček a klikni na něj.', 'info'); anim($('paper').querySelector('.slot.blink'), 'wiggle'); }
  else { notice(`💡 Klikni do pole „Najít“ nad dokumentem a napiš: ${st.target}`, 'info'); $('searchInput').focus(); }
}
function chapterComplete() {
  const stars = S.mistakes === 0 ? 3 : S.mistakes <= 2 ? 2 : 1;
  data.stars[S.ch] = Math.max(data.stars[S.ch] || 0, stars); save();
  renderTrack();
  setMood('happy');
  later(() => {
    const c = curChapter();
    $('doneNum').textContent = `Kapitola ${S.ch + 1} z ${CHAPTERS.length} hotová`;
    $('doneEmoji').textContent = c.emoji;
    $('doneTitle').textContent = c.title + ' ✓';
    $('doneText').textContent = c.outro;
    $('doneStats').textContent = `Chyby: ${S.mistakes} · Nápovědy: ${S.hints}` + (stars < 3 ? ' · Bez chyby získáš 3 hvězdy.' : ' · Bez jediné chyby!');
    renderStars($('doneStars'), stars);
    $('doneNext').textContent = S.ch === CHAPTERS.length - 1 ? 'Velké finále →' : 'Další kapitola →';
    show('chapterDone');
    sfx.win(); rain();
    $('doneNext').focus();
  }, 700);
}
function renderStars(el, n, max = 3) {
  el.replaceChildren();
  for (let i = 0; i < max; i++) {
    const s = document.createElement('span');
    s.className = 'star' + (i < n ? ' on' : '');
    s.textContent = '★';
    s.style.animationDelay = i * 0.18 + 's';
    el.append(s);
  }
}
function storyFinale() {
  const total = data.stars.reduce((a, b) => a + b, 0);
  renderStars($('finalStars'), total, 15);
  $('finalText').textContent = `Noviny voní tiskárnou, pozvánka visí, bábovky jsou snědené a v pátek se jede na Karlštejn! Bez tebe bych to nezvládl. Máš ${total} z 15 hvězd${total === 15 ? ' – jsi opravdový mistr zkratek!' : '. Zkus některé kapitoly zahrát bez chyby a posbírej všechny!'}`;
  show('storyEnd'); sfx.win(); rain(); setTimeout(rain, 900);
}

/* =================================================================
   TRÉNINK
   ================================================================= */
const T = { queue: [], i: 0, score: 0, mistakes: 0, hints: 0, t0: 0, tTask: 0, hint: false, timer: null, lock: 0, result: '', elapsed: 0 };
const fmtTime = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
function trainStart() {
  clearInterval(T.timer);
  Object.assign(T, { queue: shuffle(ORDER), i: 0, score: 0, mistakes: 0, hints: 0, t0: Date.now(), lock: 0 });
  $('tScore').textContent = '0';
  show('train');
  T.timer = setInterval(() => { $('tTime').textContent = fmtTime(Date.now() - T.t0); }, 100);
  trainTask();
}
function trainDots() {
  $('tDots').replaceChildren(...T.queue.map((_, i) => { const d = document.createElement('i'); d.className = i < T.i ? 'done' : i === T.i ? 'current' : ''; return d; }));
}
function trainTask() {
  if (T.i >= T.queue.length) { trainEnd(); return; }
  const k = T.queue[T.i];
  T.hint = false; T.tTask = Date.now(); kbHint(null);
  $('tIcon').textContent = SC[k].icon;
  $('tIcon').className = 't-icon ico-' + k;
  $('tTitle').textContent = TASK_TEXT[k][0];
  $('tText').textContent = TASK_TEXT[k][1];
  $('tCount').textContent = `${T.i + 1} / ${T.queue.length}`;
  $('tFeedback').textContent = ''; $('tFeedback').className = 'feedback';
  trainDots();
  anim($('tCard'), 'card-in');
}
function trainKey(k, extra) {
  if (Date.now() < T.lock || T.i >= T.queue.length) return;
  if (extra) { notice('Bez Shiftu a Altu – jen Ctrl a písmeno.', 'info'); return; }
  const want = T.queue[T.i];
  if (k === want) {
    const dt = Date.now() - T.tTask;
    const bonus = dt < 3000 ? 5 : dt < 6000 ? 2 : 0;
    const gain = (T.hint ? 5 : 10) + bonus;
    T.score += gain; T.lock = Date.now() + 450;
    kbFlash(k, 'ok'); sfx.good();
    $('tScore').textContent = T.score;
    notice(`✓ ${SC[k].label} – ${rand(PRAISE)} +${gain}${bonus === 5 ? ' ⚡ bleskově!' : ''}`, 'good');
    $('tSay').textContent = rand(['To je ono!', 'Rychlý jak blesk!', 'Další!', 'Pecka!']);
    setMood('happy');
    floatText($('tScore'), '+' + gain, 'good');
    burstAt($('tIcon'), 16, 80);
    T.i++;
    setTimeout(trainTask, 450);
  } else {
    T.mistakes++; T.score = Math.max(0, T.score - 3);
    kbFlash(k, 'bad'); sfx.bad();
    $('tScore').textContent = T.score;
    notice(`✗ ${wrongText(k)} Zkus jinou. −3 body`, 'bad');
    $('tSay').textContent = 'Ups! Ale nevzdávej to.';
    setMood('sad');
    anim($('tCard'), 'shake');
    floatText($('tScore'), '−3', 'bad');
  }
}
function trainHint() {
  if (screen !== 'train' || T.i >= T.queue.length) return;
  const k = T.queue[T.i];
  if (!T.hint) T.hints++;
  T.hint = true; kbHint(k);
  notice(`💡 ${SC[k].label} – ${SC[k].hook}. Za tuhle zkratku dostaneš poloviční body.`, 'info');
}
function trainEnd() {
  clearInterval(T.timer);
  T.elapsed = Date.now() - T.t0;
  const stars = T.mistakes === 0 && T.hints === 0 ? 3 : T.mistakes <= 3 ? 2 : 1;
  $('teTime').textContent = fmtTime(T.elapsed);
  $('teScore').textContent = T.score;
  $('teMist').textContent = T.mistakes;
  $('teHints').textContent = T.hints;
  $('teTitle').textContent = stars === 3 ? 'Bez jediné chyby! 🏆' : stars === 2 ? 'Skvělá práce!' : 'Dobrý začátek!';
  renderStars($('teStars'), stars);
  const best = data.best;
  const isRecord = !best || T.score > best.score || (T.score === best.score && T.elapsed < best.time);
  if (isRecord) { data.best = { score: T.score, time: T.elapsed }; save(); }
  $('teRecord').textContent = isRecord ? '🎉 Nový osobní rekord!' : `Tvůj rekord: ${best.score} bodů za ${fmtTime(best.time)}`;
  $('teRecord').classList.toggle('new', isRecord);
  updateSummary();
  show('trainEnd'); sfx.win(); if (stars >= 2) rain();
  $('teAgain').focus();
}
function updateSummary() {
  const name = $('teName').value.trim() || 'Hráč';
  T.result = `${name} | Trénink zkratek | ${T.score} bodů | čas ${fmtTime(T.elapsed)} | chyby ${T.mistakes} | nápovědy ${T.hints} | ${new Date().toLocaleDateString('cs-CZ')}`;
  $('teSummary').textContent = T.result;
}
async function copyResult() {
  const b = $('teCopy');
  try { await navigator.clipboard.writeText(T.result); b.textContent = '✓ Zkopírováno'; }
  catch {
    b.textContent = 'Označeno – zkopíruj Ctrl + C 😉';
    const r = document.createRange(); r.selectNodeContents($('teSummary'));
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  setTimeout(() => { b.textContent = '📋 Zkopírovat výsledek'; }, 2200);
}

/* =================================================================
   ÚVODNÍ OBRAZOVKA
   ================================================================= */
const unlocked = i => i === 0 || data.stars[i - 1] > 0;
function renderHome() {
  $('chapterList').replaceChildren(...CHAPTERS.map((c, i) => {
    const b = document.createElement('button');
    const open = unlocked(i);
    b.className = 'chapter' + (open ? '' : ' locked') + (data.stars[i] ? ' won' : '');
    b.disabled = !open;
    b.innerHTML = `<span class="ch-emoji">${open ? c.emoji : '🔒'}</span><span class="ch-name"><small>Kapitola ${i + 1}</small>${c.title}</span><span class="ch-stars">${'★'.repeat(data.stars[i] || 0)}<i>${'★'.repeat(3 - (data.stars[i] || 0))}</i></span>`;
    b.addEventListener('click', () => openChapter(i));
    return b;
  }));
  const next = CHAPTERS.findIndex((_, i) => !data.stars[i]);
  $('storyStart').textContent = next === 0 ? 'Začít příběh →' : next === -1 ? 'Zahrát znovu od začátku →' : `Pokračovat: kapitola ${next + 1} →`;
  $('trainBest').innerHTML = data.best ? `🏆 Tvůj rekord: <b>${data.best.score} bodů</b> za <b>${fmtTime(data.best.time)}</b>` : 'Zatím žádný rekord. Budeš první?';
  $('cheatsheet').replaceChildren(...ORDER.map(k => {
    const d = document.createElement('div'); d.className = 'cheat-item';
    d.innerHTML = `<span class="ci-ico ico-${k}">${SC[k].icon}</span><span class="ci-text"><b>${SC[k].name}</b><small>${SC[k].hook}</small></span><kbd>Ctrl</kbd><kbd>${k.toUpperCase()}</kbd>`;
    return d;
  }));
}
function goHome() { clearStoryTimers(); clearInterval(T.timer); kbHint(null); renderHome(); show('home'); }

/* ---------- Napojení událostí ---------- */
function init() {
  document.querySelectorAll('.klik-slot').forEach(s => { s.innerHTML = klikSVG(); });
  buildKeyboards();
  renderToolbar();
  renderHome();
  $('soundBtn').textContent = data.sound ? '🔊' : '🔇';
  $('soundBtn').setAttribute('aria-pressed', String(data.sound));

  $('storyStart').addEventListener('click', () => { const n = CHAPTERS.findIndex((_, i) => !data.stars[i]); openChapter(n === -1 ? 0 : n); });
  $('trainStart').addEventListener('click', trainStart);
  $('introGo').addEventListener('click', beginChapter);
  $('storyHint').addEventListener('click', storyHint);
  $('doneNext').addEventListener('click', () => { if (S.ch === CHAPTERS.length - 1) storyFinale(); else openChapter(S.ch + 1); });
  $('doneAgain').addEventListener('click', () => openChapter(S.ch));
  $('finalTrain').addEventListener('click', trainStart);
  $('tHint').addEventListener('click', trainHint);
  $('tQuit').addEventListener('click', goHome);
  $('teAgain').addEventListener('click', trainStart);
  $('teCopy').addEventListener('click', copyResult);
  $('teName').addEventListener('input', updateSummary);
  $('logoBtn').addEventListener('click', goHome);
  document.querySelectorAll('[data-home]').forEach(b => b.addEventListener('click', goHome));
  $('soundBtn').addEventListener('click', () => {
    data.sound = !data.sound; save();
    $('soundBtn').textContent = data.sound ? '🔊' : '🔇';
    $('soundBtn').setAttribute('aria-pressed', String(data.sound));
    sfx.tick();
  });

  const paper = $('paper');
  paper.addEventListener('mouseup', () => setTimeout(checkSelection, 0));
  paper.addEventListener('touchend', () => setTimeout(checkSelection, 0));
  paper.addEventListener('keyup', () => setTimeout(checkSelection, 0));
  paper.addEventListener('click', e => {
    const st = curStep();
    if (screen === 'story' && st && st.type === 'click' && !e.target.closest('.slot') && !String(window.getSelection())) notice('Klikni přímo na blikající rámeček.', 'info');
  });
  $('searchInput').addEventListener('input', onSearchInput);

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', e => { if (e.key === 'Control' || e.key === 'Meta') kbCtrl(false); });
  window.addEventListener('blur', () => kbCtrl(false));
  window.addEventListener('resize', () => { if (screen === 'story') placeRunner(); });
}
init();
