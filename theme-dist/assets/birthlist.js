/* נבנה אוטומטית מ-ui/birthlist.html על ידי build_theme.py — לא לערוך ידנית */
(() => {
'use strict';
/* =====================================================================
   הגדרות — כל מה שדניאל שולט בו נמצא כאן, ורק כאן
   ===================================================================== */
const CONFIG = {
  // 🔑 כתובת הנתונים — הקבוע היחיד. מעבר ל-Cloudflare = שינוי השורה הזו בלבד.
  DATA_BASE: 'https://pub-16b109ac2c064d7cb1eda50bf0354d78.r2.dev/',
  // תמונות מוצרים — מתג אחד לכולם. אין מתג למשתמשים.
  SHOW_IMAGES: true,
  // מחיר שנבדק לפני יותר מ-X ימים: מ-WARN מציגים אזהרה, מ-HIDE לא מציגים בכלל.
  STALE_WARN_DAYS: 7,
  STALE_HIDE_DAYS: 30,
  MODELS_PAGE: 50,              // כמה מוצרים מציגים בכל פעם בגלריה
  MAX_MONTHS: 10,               // תקרה לפריסה חודשית
  MONTH_MAX_EARLY: 4,           // כמה חודשים לכל היותר מותר להקדים פריט כדי לאזן את ההוצאה החודשית
  STORE_HOME: 'https://memommyclub.com',
};
// ⚙️ שלב F: הגדרות מעורך התמה של Shopify (מוזרקות על ידי sections/birthlist.liquid)
const BL_SETTINGS = (() => { try { return JSON.parse(document.getElementById('bl-settings').textContent) || {}; } catch(e) { return {}; } })();
Object.assign(CONFIG, BL_SETTINGS.config || {});
const T = (k, d) => (BL_SETTINGS.text && BL_SETTINGS.text[k]) || d;

// 📅 פריסה חודשית — כמה חודשים לפני הלידה מומלץ לקנות כל קטגוריה.
// 0 = בחודש הלידה. דניאל קובע את המספרים; אלה ברירות מחדל בלבד.
const BUY_MONTHS_BEFORE = {
  'עגלה': 3, 'בטיחות': 2, 'חדר שינה': 3, 'פעילויות': 0, 'אמבטיה': 1,
  'ביגוד': 1, 'האכלה': 1, 'טיפול והגיינה': 0, 'לאם': 1,
};
// חריגים לפריט בודד (לפי מספר הפריט) — גובר על הקטגוריה. למשל: {6: 2, 57: 0}
const BUY_MONTHS_BEFORE_ITEM = { 1: 4, 12: 4, 74: 0 };

// שמות תצוגה למותגים (בקובץ הנתונים המותג הוא מזהה מקוצר). מותג שלא כאן → לא מוצג.
const BRAND_NAMES = {shilav:'שילב',minene:'מיננה',chicco:'Chicco',twigy:'Twigy',laura:'Laura',nino:'Nino',olimoli:'Olimoli',segal:'סגל בייבי',lorens:'Lorens',joie:'Joie',cybex:'Cybex',tal:'טל',suavinex:'Suavinex',nuna:'Nuna',avent:'Philips Avent',boobee:'Boobee',simplygood:'Simply Good',tinylove:'Tiny Love',biamba:'Biamba',drfischer:'ד"ר פישר',lume:'Lume',sportline:'Sportline',mommycare:'Mommy Care',graco:'Graco',lovi:'Lovi',mam:'MAM',moona:'Moona',babytech:'BabyTech',anex:'Anex',tommeetippee:'Tommee Tippee',aminach:'עמינח',medela:'Medela',infanti:'Infanti',britax:'Britax',bebejou:'Bébé-Jou',bugaboo:'Bugaboo',dainys:'Dainys',nuk:'NUK',mushie:'Mushie',kinderkraft:'Kinderkraft',lansinoh:'Lansinoh',flyontex:'Flyontex',babybjorn:'BabyBjörn',lamer:'לאמר',bibs:'BIBS',stokke:'Stokke',beurer:'Beurer',loopump:'Loopump',farmamedic:'פארמה מדיק',babytouch:'Baby Touch',brightstarts:'Bright Starts',pelicare:'Pelicare',taftoys:'Taf Toys',nuby:'Nuby',sweetie:'Sweetie',mustela:'Mustela',nuvita:'Nuvita',fehn:'Fehn',dillians:'Dillians',maxicosi:'Maxi-Cosi',huggies:'Huggies',litaf:'ליטף',frigg:'Frigg',babytrend:'Baby Trend',miyababy:'Miya Baby',weleda:'Weleda',hegen:'Hegen',babysafe:'BabySafe',winfun:'WinFun',nanit:'Nanit',mamaspapas:'Mamas & Papas',elysium:'Elysium',ergobaby:'Ergobaby',pampers:'Pampers',munchkin:'Munchkin',hape:'Hape',donebydeer:'Done by Deer',babyeinstein:'Baby Einstein',doona:'Doona',babymonsters:'Baby Monsters',nip:'NIP',beaba:'Béaba',battat:'Battat',infantino:'Infantino',fisherprice:'Fisher-Price',yookidoo:'Yookidoo',evenflo:'Evenflo',besafe:'BeSafe',babyjogger:'Baby Jogger',joolz:'Joolz',kidsconcept:'Kids Concept',minimonkey:'Minimonkey',babybrezza:'Baby Brezza',bopita:'Bopita',owlet:'Owlet',babyark:'Babyark','4moms':'4moms',inglesina:'Inglesina',uppababy:'UPPAbaby',polarb:'Polar B',nattou:'Nattou'};
const STORE_COLORS = {shilav:'#5B8DEF',babystar:'#E27D60',motsesim:'#8E6BBF',agalease:'#4FA37A',minene:'#D48CB0',superpharm:'#3A9BC5'};
const CAT_EMOJI = {'עגלה':'🛒','בטיחות':'🛡️','חדר שינה':'🛏️','פעילויות':'🧸','אמבטיה':'🛁','ביגוד':'👕','האכלה':'🍼','טיפול והגיינה':'🧴','לאם':'🤱'};
// שתי קטגוריות קיבלו איור משלהן: עגלת תינוק (ולא עגלת סופר) ועריסה.
const CAT_SVG = {
  'עגלה': `<svg class="cico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.6h11.2"/><path d="M14.7 12.6V8.2a5.6 5.6 0 0 0-11.2 0v4.4"/><path d="M14.7 8.2 19.6 5.4"/><path d="M6 12.6v2.6M12.4 12.6v2.6"/><circle cx="5.6" cy="17.4" r="2"/><circle cx="12.8" cy="17.4" r="2"/></svg>`,
  'חדר שינה': `<svg class="cico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.4h16"/><path d="M5.2 8.4v8.2M18.8 8.4v8.2"/><path d="M5.2 13.6h13.6"/><path d="M8.4 8.4v5.2M12 8.4v5.2M15.6 8.4v5.2"/><path d="M3.6 16.6a18 18 0 0 0 16.8 0"/></svg>`,
};
const catIcon = c => CAT_SVG[c] || CAT_EMOJI[c] || '🍼';
const TWINS_DOUBLE = new Set([6, 7, 12, 14, 15, 21, 32, 33, 35, 36]); // תאומים → כמות כפולה
const TAGS = {'חובה':'must','מומלץ':'rec','לא חובה':'opt'};
const TAG_ORDER = ['חובה','מומלץ','לא חובה'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const WHO = { me:'אני קונה', gift:'לבקש במתנה', given:'מגיע במתנה' };

/* =====================================================================
   עזרים
   ===================================================================== */
const ROOT = document.getElementById('bl');
const $ = (s, r=ROOT) => r.querySelector(s);
const $$ = (s, r=ROOT) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nis = n => (Math.abs(n % 1) < 0.005 ? Math.round(n).toLocaleString('he-IL') : n.toLocaleString('he-IL', {minimumFractionDigits: 2, maximumFractionDigits: 2})) + ' ₪';
const TODAY = new Date();
const daysAgo = iso => Math.floor((TODAY - new Date(iso)) / 864e5);
const fmtChecked = iso => { const d = daysAgo(iso); return d <= 0 ? 'נבדק היום' : d === 1 ? 'נבדק אתמול' : `נבדק לפני ${d} ימים`; };
const fmtDate = iso => new Date(iso).toLocaleDateString('he-IL', {day:'numeric', month:'numeric'});
// שם המותג מגיע מהקובץ המפורסם (bl_data.brands — נבנה ב-build_bundle.py, שם גם מתקנים שמות).
// הטבלה המקומית למעלה נשארת רק כרשת ביטחון לקובץ נתונים ישן שנשמר במטמון.
const brandName = b => !b ? '' : ((DATA && DATA.brands && DATA.brands[b]) || (b.includes(':') ? '' : (BRAND_NAMES[b] || b)));
const ic = id => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let toastT; function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
const ls = {
  get(k){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch(e) { return null; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} },
  del(k){ try { localStorage.removeItem(k); } catch(e) {} },
};
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));

/* =====================================================================
   מתג הזהות — "מי מחובר/ת" + שמירה/טעינה של הרשימה.
   שלב G: אמיתי. מזוהים לפי חשבון הלקוחה של שופיפיי (Google/Shop/מייל+קוד).
   loadList/saveList/whoami עוברים דרך ה-App Proxy (memommyclub.com/apps/birthlist/*),
   שמזהה את הלקוחה מהחתימה של שופיפיי בלבד — לא לפי שום דבר שהדפדפן שולח.
   הממשק לא יודע ולא צריך לדעת מה מאחורי הפונקציות האלה.
   ===================================================================== */
// כל בקשה לכתובת הזו מועברת (חתומה) לווקר של שלב G — קבוע טכני, לא בהגדרות.
const APP_PROXY_BASE = '/apps/birthlist/';
const Identity = (() => {
  const KEY_DRAFT = 'bl_draft';
  const AUTH_MARK = 'blauth';   // סימון שאנחנו שמים בכתובת החזרה, כדי לזהות "רגע אחרי התחברות"
  let cachedUser; // undefined = עוד לא נבדק בטעינה הזו

  async function whoami(){
    try {
      const r = await fetch(APP_PROXY_BASE + 'whoami', {credentials:'same-origin', cache:'no-store'});
      const d = await r.json();
      return (d && d.ok && d.logged_in) ? {id:'shopify', admin: !!d.admin} : null;
    } catch(e) { return null; }
  }

  return {
    mode: 'live',
    async current(){
      if (cachedUser === undefined) cachedUser = await whoami();
      return cachedUser;
    },
    // יציאה להרשמה/התחברות של שופיפיי. draft = כל מה שמולא עד עכשיו — חייב לשרוד את היציאה מהעמוד.
    // נשמר בשני מקומות: באחסון המקומי, וגם מקודד בכתובת שאליה שופיפיי תחזיר אותנו.
    signIn(provider, draft){
      ls.set(KEY_DRAFT, draft);
      const back = new URL(location.href);
      back.searchParams.set(AUTH_MARK, '1');
      back.hash = 'd=' + b64e(JSON.stringify(draft));
      const login = new URL('/account/login', CONFIG.STORE_HOME);
      login.searchParams.set('return_url', back.pathname + back.search + back.hash);
      location.href = login.toString();
    },
    // נקרא בכל טעינה: אם חזרנו מהתחברות (יש סימון בכתובת) — מחזיר את הטיוטה ששרדה.
    // לא קובע לבד אם ההתחברות הצליחה — את זה בודקים בנפרד עם current().
    completeSignIn(){
      const u = new URL(location.href);
      if (!u.searchParams.get(AUTH_MARK)) return null;
      let draft = null;
      const m = /(?:^|[#&])d=([^&]+)/.exec(u.hash);
      if (m) { try { draft = JSON.parse(b64d(m[1])); } catch(e) {} }
      draft = draft || ls.get(KEY_DRAFT); ls.del(KEY_DRAFT);
      try {
        const clean = new URL(u.pathname + u.search, location.origin);
        clean.searchParams.delete(AUTH_MARK);
        history.replaceState(null, '', clean.pathname + clean.search);
      } catch(e) {}
      return {draft};
    },
    signOut(){
      const back = new URL(location.pathname, CONFIG.STORE_HOME);
      const logout = new URL('/account/logout', CONFIG.STORE_HOME);
      logout.searchParams.set('return_url', back.pathname);
      location.href = logout.toString();
    },
    async loadList(){
      const r = await fetch(APP_PROXY_BASE + 'list', {credentials:'same-origin'});
      const d = await r.json();
      return (d && d.ok) ? d.list : null;
    },
    async saveList(_uid, list){
      try {
        await fetch(APP_PROXY_BASE + 'list', {
          method:'POST', credentials:'same-origin',
          headers:{'content-type':'application/json'},
          body: JSON.stringify(list),
        });
      } catch(e) {}
    },
  };
})();

/* =====================================================================
   טעינת הנתונים — תמיד שתי משיכות, בסדר הזה (מסמך 23 פרק 2)
   ===================================================================== */
let DATA = null, VERSION = null, STORES = {}, ITEMS = [], MODELS = [], CATS = [];
let modelsByItem = {}, modelById = {}, itemById = {}, hiddenByItem = {};
let OVERRIDES = { v:1, models:{} }, IS_ADMIN = false, RAW_MODELS = null;

async function loadData(){
  const ver = await fetch(CONFIG.DATA_BASE + 'bl_version.json?t=' + Date.now(), {cache:'no-store'}).then(r => { if (!r.ok) throw new Error('version ' + r.status); return r.json(); });
  const data = await fetch(CONFIG.DATA_BASE + 'bl_data.json?v=' + ver.v).then(r => { if (!r.ok) throw new Error('data ' + r.status); return r.json(); });
  if (!data.items || !data.models || !data.stores) throw new Error('bad data');
  VERSION = ver; DATA = data;
  // תיקוני המנהל (של דניאל) — אם אינם זמינים, הכלי עובד רגיל עם הקובץ כמו שהוא
  try {
    const r = await fetch(APP_PROXY_BASE + 'overrides', {credentials:'same-origin', cache:'no-store'});
    const d = await r.json();
    if (d && d.ok && d.overrides && typeof d.overrides === 'object' && !Array.isArray(d.overrides)) OVERRIDES = Object.assign({v:1, models:{}}, d.overrides);
  } catch(e) {}
  prepareData();
}
/* ---------- עריכות המנהל על מבנה הרשימה (קרן) ----------
   אותם כללים בדיוק כמו ב-build_bundle.apply_item_edits: הקובץ הלילי כבר נבנה איתם,
   וכאן הם מוחלים גם על הקובץ של היום כדי שהעריכה תיראה מיד ולא רק מחר בבוקר.
   מזהה פריט לעולם לא משתנה — ולכן רשימה שמורה של אמא לא מושפעת משום שינוי שם.   */
const ITEM_TAGS = ['חובה', 'מומלץ', 'לא חובה'];
const BAD_NAME_BITS = ['לא בשימוש', 'אוחד עם'];      // self_check פוסל שם כזה — לא נותנים לו להיווצר
const NEW_ITEM_FLOOR = 1000;
const cleanName = v => String(v == null ? '' : v).split(/\s+/).filter(Boolean).join(' ').slice(0, 40);
const nameOk = v => !!v && !BAD_NAME_BITS.some(b => v.includes(b));
function resolveRen(ren){
  const out = {}, targets = new Set(Object.values(ren || {}));
  for (const k of Object.keys(ren || {})) {
    let cur = ren[k], seen = new Set([k]);
    for (let i = 0; i < 8; i++) { const nx = ren[cur]; if (nx == null || seen.has(cur)) break; seen.add(cur); cur = nx; }
    if (cur !== k && !targets.has(k)) out[k] = cur;
  }
  return out;
}
function itemEdits(rows){
  const ov = OVERRIDES.items || {};
  const items = rows.map(r => ({...r}));
  if (!ov || !Object.keys(ov).length) return items;
  const cats = new Set(items.map(i => i.c));
  for (const [old, nw] of Object.entries(resolveRen((ov.cats || {}).ren || {}))) {
    const n = cleanName(nw);
    if (!nameOk(n) || !cats.has(old) || (cats.has(n) && n !== old)) continue;
    items.forEach(i => { if (i.c === old) { if (!i.c0) i.c0 = old; i.c = n; } });
    cats.delete(old); cats.add(n);
  }
  const used = new Set(items.map(i => i.id));
  const liveCats = new Set([...cats, ...((ov.cats || {}).add || []).map(cleanName)]);
  for (const e of ov.add || []) {
    const id = +e.id, n = cleanName(e.n), c = cleanName(e.c);
    if (!Number.isInteger(id) || id < NEW_ITEM_FLOOR || used.has(id)) continue;
    if (!nameOk(n) || !nameOk(c) || !liveCats.has(c)) continue;
    items.push({ id, c, n, nm: 0, t: ITEM_TAGS.includes(e.t) ? e.t : 'מומלץ', q: Math.max(1, Math.min(9, +e.q || 1)) });
    used.add(id);
  }
  const byId = {}; items.forEach(i => byId[i.id] = i);
  for (const [k, v] of Object.entries(ov.ren || {})) { const it = byId[+k], n = cleanName(v); if (it && nameOk(n)) it.n = n; }
  for (const [k, v] of Object.entries(ov.tag || {})) { const it = byId[+k]; if (it && ITEM_TAGS.includes(v)) it.t = v; }
  return items;
}
// קטגוריה ששמה שונה: הטבלאות של חודשי הקנייה ושל האייקון מפתוחות בשם המקורי
let CAT_ORIG = {}, CAT_NEW = {};
const catKey = c => CAT_ORIG[c] || c;
function prepareData(){
  STORES = DATA.stores;
  for (const [k, s] of Object.entries(STORES)) { s.id = k; s.days = daysAgo(s.d); s.hidden = s.days > CONFIG.STALE_HIDE_DAYS; s.stale = s.days > CONFIG.STALE_WARN_DAYS; }
  ITEMS = itemEdits(DATA.items).sort((a, b) => a.id - b.id);
  CAT_ORIG = {}; CAT_NEW = {};
  ITEMS.forEach(i => { if (i.c0 && i.c0 !== i.c) { CAT_ORIG[i.c] = i.c0; CAT_NEW[i.c0] = i.c; } });
  itemById = {}; modelsByItem = {}; modelById = {}; hiddenByItem = {};
  ITEMS.forEach(i => { itemById[i.id] = i; modelsByItem[i.id] = []; });
  CATS = [...new Set(ITEMS.map(i => i.c))];
  RAW_MODELS = RAW_MODELS || DATA.models;    // המקור נשמר כמו שהוא — התיקונים מוחלים על עותקים, כך שאפשר להחיל מחדש
  MODELS = [];
  const ovAll = OVERRIDES.models || {};
  for (const raw of RAW_MODELS) {
    const ov = ovAll[raw.id] || {};
    const m = {...raw};
    if (ov.name) m.n = ov.name;
    if (ov.item && itemById[ov.item]) m.i = ov.item;
    if (ov.img && isShopifyImg(ov.img)) m.img = ov.img;
    const hs = new Set(ov.hs || []);
    m.offers = Object.entries(m.o).filter(([sid]) => STORES[sid] && !STORES[sid].hidden && !hs.has(sid))
      .map(([sid, o]) => ({sid, p:o.p, px:o.px, a:o.a === 1, u:(ov.url && ov.url[sid]) || o.u}))
      .sort((a, b) => (a.p - b.p) || (b.a - a.a));
    if (!m.offers.length) continue;
    m.best = m.offers[0];
    m.min = m.offers[0].p;
    m.maxP = Math.max(...m.offers.map(o => o.p));
    m.nStores = m.offers.length;
    m.brand = brandName(m.b);
    modelById[m.id] = m;
    if (ov.hide) { m.adminHidden = true; (hiddenByItem[m.i] = hiddenByItem[m.i] || []).push(m); continue; }
    if (modelsByItem[m.i]) { modelsByItem[m.i].push(m); MODELS.push(m); }
  }
  // איחוד שורות: שורה שנבלעה בתוך אחרת משאירה כינוי. רשימה שנשמרה על השורה
  // הישנה חייבת עדיין למצוא את המוצר — אחרת איחוד היה מרוקן למישהי את הרשימה.
  for (const [from, to] of Object.entries((DATA && DATA.alias) || {})) if (modelById[to]) modelById[from] = modelById[to];
  applyMergesLive();      // איחודים שהמנהל עשה היום — לראות מיד, לא רק אחרי העדכון הלילי
  applyManualLive();      // חנות שנוספה להשוואה עם מחיר ידני — אותו דבר
  for (const list of Object.values(modelsByItem)) list.sort((a, b) => a.min - b.min || a.n.localeCompare(b.n, 'he'));
  for (const list of Object.values(hiddenByItem)) list.sort((a, b) => a.min - b.min || a.n.localeCompare(b.n, 'he'));
}

/* אותם כללים כמו apply_merges במנוע: המזהה הראשון בקבוצה שורד, הנבלעת מוסיפה לו
   רק חנויות שעוד אין לו, וממשיכה להצביע עליו (כינוי) — כדי שרשימה שנשמרה עליה
   לא תתרוקן. חציית פריטים נדחית, בדיוק כמו במנוע. */
function recalcModel(m){
  m.offers.sort((a, b) => (a.p - b.p) || (b.a - a.a));
  m.best = m.offers[0]; m.min = m.offers[0].p;
  m.maxP = Math.max(...m.offers.map(o => o.p)); m.nStores = m.offers.length;
}
function dropFromGallery(m){
  const list = modelsByItem[m.i], k = list ? list.indexOf(m) : -1; if (k >= 0) list.splice(k, 1);
  const j = MODELS.indexOf(m); if (j >= 0) MODELS.splice(j, 1);
}
function applyMergesLive(){
  for (const g of (OVERRIDES.merge || [])) {
    const ids = (g || []).map(String).filter(id => modelById[id]);
    if (ids.length < 2) continue;
    const keep = modelById[ids[0]];
    for (const oid of ids.slice(1)) {
      const o = modelById[oid];
      if (!o || o === keep || o.i !== keep.i) continue;
      const have = new Set(keep.offers.map(x => x.sid));
      o.offers.forEach(x => { if (!have.has(x.sid)) keep.offers.push(x); });
      if (o.cl && o.cl.length) keep.cl = [...new Set([...(keep.cl || []), ...o.cl])];
      if (!keep.img && o.img) keep.img = o.img;
      dropFromGallery(o);
      modelById[oid] = keep;
    }
    recalcModel(keep);
  }
}
// "הוספת חנות להשוואה" למוצר שעוד לא בסריקה: המחיר שהמנהל הזין מוצג מיד,
// והעדכון הלילי מחליף אותו במחיר החי ברגע שהסריקה מוצאת את המוצר.
function applyManualLive(){
  for (const e of Object.values(OVERRIDES.manual || {})) {
    if (!e || !e.attach || !(+e.price > 0)) continue;
    const m = modelById[e.attach]; if (!m) continue;
    const sid = manualStoreOf(e.url || '');
    if (!sid || !STORES[sid] || STORES[sid].hidden) continue;
    if (m.offers.some(o => o.sid === sid)) continue;      // הסריקה כבר הביאה את החנות הזו
    m.offers.push({ sid, p: +e.price, a: true, u: e.url, byHand: true });
    recalcModel(m);
  }
}

/* ---------- תיקוני מנהל — רק דניאל רואה ושומר; משפיעים על כל הנשים ---------- */
function ovOf(mid){ return (OVERRIDES.models || {})[mid] || {}; }
function setOverride(mid, patch){
  OVERRIDES.models = OVERRIDES.models || {};
  const o = OVERRIDES.models[mid] = Object.assign({}, OVERRIDES.models[mid]);
  for (const [k, v] of Object.entries(patch)) {
    const empty = v == null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
    if (empty) delete o[k]; else o[k] = v;
  }
  if (!Object.keys(o).length) delete OVERRIDES.models[mid];
}
/* השמירה נכשלה בשקט יותר מפעם אחת (דיווח של דניאל, 20.9): הודעה גנרית, בלי לדעת
   אם זו הרשאה, רשת, או מגבלת קצב של שופיפיי. עכשיו: שלושה ניסיונות עם השהיה
   גדלה (מגבלת קצב חולפת מעצמה), והסיבה האמיתית נכנסת להודעה ולקונסול. */
let LAST_SAVE_ERR = '';
const saveErrNote = () => LAST_SAVE_ERR ? ` (${LAST_SAVE_ERR})` : '';
// שתי שמירות שרצות במקביל על אותו metafield יכולות להתנגש — לכן הן נכנסות לתור.
let SAVE_CHAIN = Promise.resolve(true);
function saveOverrides(){
  const run = () => saveOverridesNow();
  const p = SAVE_CHAIN.then(run, run);
  SAVE_CHAIN = p.catch(() => false);
  return p;
}
async function saveOverridesNow(tries = 3){
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(APP_PROXY_BASE + 'overrides', {method:'POST', credentials:'same-origin', headers:{'content-type':'application/json'}, body: JSON.stringify(OVERRIDES)});
      let d = null; try { d = await r.json(); } catch(e) {}
      if (d && d.ok) { LAST_SAVE_ERR = ''; return true; }
      LAST_SAVE_ERR = 'שגיאה ' + r.status + (d && d.error ? ' · ' + d.error : '');
    } catch(e) {
      LAST_SAVE_ERR = 'אין חיבור לשרת' + (e && e.message ? ' · ' + e.message : '');
    }
    if (i < tries - 1) await new Promise(ok => setTimeout(ok, 700 * (i + 1)));
  }
  console.warn('[birthlist] overrides save failed:', LAST_SAVE_ERR);
  return false;
}
async function adminApply(mid, patch, msg){
  setOverride(mid, patch);
  prepareData(); renderList();
  toast((await saveOverrides()) ? msg : 'התיקון מוצג אצלך, אבל השמירה נכשלה — לנסות שוב' + saveErrNote());
}

/* =====================================================================
   מצב המשתמש/ת
   sel[itemId] = [ {id, m, s, q, who, name, sname} ]   — אפשר כמה מוצרים לאותו פריט
   custom = [ {id, i, c, name, store, price, url, q, who} ] — מוצרים שהוספו ידנית (i = פריט, או null)
   ===================================================================== */
const EMPTY = () => ({ profile:null, sel:{}, have:{}, custom:[], open:null, tour:0 });
let USER = null, S = EMPTY();
let UI = { filter:'all', q:'', view:'list', bstore:null };
let saveT;
function save(){ if (!USER) return; clearTimeout(saveT); saveT = setTimeout(flushSave, 150); }
function flushSave(){ clearTimeout(saveT); saveT = null; if (USER) Identity.saveList(USER.id, S); }
window.addEventListener('pagehide', () => { if (saveT) flushSave(); });
// מיישר רשימה מכל גרסה לצורה הנוכחית
function normalize(st){
  const out = EMPTY(); if (!st) return out;
  out.profile = st.profile || null; out.open = st.open ?? null; out.have = {...(st.have || {}), ...(st.skip || {})};
  out.tour = st.tour ? 1 : 0;                       // 1 = ההדרכה כבר הוצגה לחשבון הזה
  out.custom = Array.isArray(st.custom) ? st.custom : [];
  for (const [k, v] of Object.entries(st.sel || {})) { const arr = Array.isArray(v) ? v : (v ? [v] : []); out.sel[k] = arr.map(p => ({id: p.id || uid(), who: p.who || 'me', ...p})); if (!out.sel[k].length) delete out.sel[k]; }
  return out;
}
function mergeDraft(base, draft){
  const out = normalize(base); if (!draft) return out; const d = normalize(draft);
  if (d.profile) out.profile = d.profile;
  if (d.tour) out.tour = 1;
  Object.assign(out.sel, d.sel); Object.assign(out.have, d.have);
  const ids = new Set(out.custom.map(c => c.id)); d.custom.forEach(c => { if (!ids.has(c.id)) out.custom.push(c); });
  return out;
}
function weeksLeft(){ if (!S.profile?.due) return null; return Math.round((new Date(S.profile.due + 'T00:00:00') - TODAY) / (7 * 864e5)); }
const dueText = () => S.profile?.due ? new Date(S.profile.due + 'T00:00:00').toLocaleDateString('he-IL') : '';
function defaultQty(it){ return (S.profile?.twins && TWINS_DOUBLE.has(it.id)) ? it.q * 2 : it.q; }

/* =====================================================================
   מסכים מלאים
   ===================================================================== */
const SCREENS = ['screen-loading','screen-error','screen-onboard','screen-build','screen-signin'];
function showScreen(id){ SCREENS.forEach(s => $('#' + s).hidden = s !== id); $('#app').hidden = !!id; $('#tabs').hidden = !!id; $('#fabAdd').hidden = !!id || UI.view !== 'list'; window.scrollTo(0, Math.max(0, ROOT.getBoundingClientRect().top + window.scrollY - 12)); }

/* ---------- 1. שאלות פתיחה ---------- */
const OB = { step: 0, due: null, twins: false, first: true };

/* ---------- קבוצות הוואטסאפ של המשוערות ----------
   לכל חודש משוער קבוצה משלו. הקישורים יושבים ב-OVERRIDES.wa, נשמרים ממסך המנהל,
   וזמינים כבר בשאלות הפתיחה — הם נטענים יחד עם שאר תיקוני המנהל, לפני שהמסך עולה.
   חודש בלי קישור מדולג בשקט: המשתמשת לא רואה כפתור שלא מוביל לשום מקום.           */
function waGroups(){ const w = OVERRIDES.wa; return (w && typeof w === 'object' && !Array.isArray(w)) ? w : {}; }
const waKey = due => String(due || '').slice(0, 7);
function waLinkFor(due){ const l = waGroups()[waKey(due)]; return (typeof l === 'string' && /^https:\/\//i.test(l.trim())) ? l.trim() : ''; }
function waMonthName(due){ const [y, m] = waKey(due).split('-'); return MONTHS_HE[+m - 1] ? `${MONTHS_HE[+m - 1]} ${y}` : ''; }
// שלבי השאלות. שלב הקבוצה קיים רק כשיש קבוצה לחודש שנבחר — ולכן המספר משתנה.
const obSteps = () => ['hello', 'date', ...(waLinkFor(OB.due) ? ['wa'] : []), 'first'];
const ART = {
  hello: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--peach-soft)"/><circle cx="80" cy="70" r="26" fill="var(--surface)"/><circle cx="70" cy="66" r="3" fill="var(--ink)"/><circle cx="90" cy="66" r="3" fill="var(--ink)"/><path d="M70 78q10 8 20 0" stroke="var(--peach-deep)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 122q30-30 60 0" fill="var(--surface)"/><circle cx="118" cy="46" r="6" fill="var(--peach)"/><circle cx="40" cy="50" r="4" fill="var(--sage)"/><circle cx="128" cy="100" r="4" fill="var(--sky)"/></svg>`,
  date: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--sky-soft)"/><rect x="42" y="50" width="76" height="66" rx="12" fill="var(--surface)"/><rect x="42" y="50" width="76" height="20" rx="12" fill="var(--peach)"/><circle cx="60" cy="88" r="5" fill="var(--line)"/><circle cx="80" cy="88" r="5" fill="var(--line)"/><circle cx="100" cy="88" r="7" fill="var(--peach-deep)"/><circle cx="60" cy="104" r="5" fill="var(--line)"/><circle cx="80" cy="104" r="5" fill="var(--line)"/></svg>`,
  first: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--sage-soft)"/><path d="M80 118s-34-20-34-44a17 17 0 0134-6 17 17 0 0134 6c0 24-34 44-34 44z" fill="var(--peach)"/><path d="M80 118s-34-20-34-44a17 17 0 0134-6" fill="none" stroke="var(--surface)" stroke-width="4" stroke-linecap="round"/></svg>`,
  group: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--sage-soft)"/><path d="M36 62a26 26 0 0126-26h36a26 26 0 0126 26v18a26 26 0 01-26 26H74l-18 16v-16h-6a14 14 0 01-14-14z" fill="var(--surface)"/><circle cx="66" cy="72" r="5" fill="var(--sage)"/><circle cx="82" cy="72" r="5" fill="var(--sage)"/><circle cx="98" cy="72" r="5" fill="var(--sage)"/><circle cx="118" cy="46" r="7" fill="var(--peach)"/></svg>`,
  lock: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--peach-soft)"/><rect x="50" y="72" width="60" height="48" rx="12" fill="var(--surface)"/><path d="M62 72V60a18 18 0 0136 0v12" fill="none" stroke="var(--peach-deep)" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="96" r="6" fill="var(--peach-deep)"/></svg>`,
};
for (const k of Object.keys(ART)) if (BL_SETTINGS.img && BL_SETTINGS.img[k]) ART[k] = `<img class="art" src="${esc(BL_SETTINGS.img[k])}" alt="" loading="lazy">`;
function renderOnboard(){
  showScreen('screen-onboard');
  const el = $('#screen-onboard');
  const months = []; for (let i = 0; i < 10; i++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1); months.push({v: d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'), t: MONTHS_HE[d.getMonth()], yy: d.getFullYear()}); }
  const steps = obSteps();
  if (OB.step >= steps.length) OB.step = steps.length - 1;
  const cur = steps[OB.step];
  const dots = `<div class="dots" aria-hidden="true">${steps.map(s => `<i class="${cur===s?'on':''}"></i>`).join('')}</div>`;
  let body = '';
  if (cur === 'hello') body = `${ART.hello}<h1>${T("ob0_title", "היי, ברוכים הבאים")}</h1><p class="lead">${T('ob0_lead', "בעוד רגע תהיה לכם רשימה מסודרת של כל מה שצריך ללידה — עם מחירים אמיתיים מ-{stores} חנויות, והכי זול מסומן.").replace('{stores}', Object.keys(STORES).length)}</p><p class="lead" style="font-size:15px">${T("ob0_sub", "שתי שאלות קצרות, ומתחילים.")}</p><div class="nav"><button class="btn primary big" id="obNext">${T("ob0_btn", "מתחילים")}</button></div>`;
  if (cur === 'date') body = `${ART.date}<h1>${T("ob1_title", "מתי התאריך המשוער?")}</h1><p class="lead">${T("ob1_lead", "לפי זה נפרוס את הקניות על החודשים שנשארו.")}</p>
    <div class="month-grid" id="obMonths">${months.map(m => `<button type="button" data-v="${m.v}" aria-pressed="${OB.due?.slice(0,7)===m.v}">${m.t}<br><small style="color:var(--muted);font-weight:400">${m.yy}</small></button>`).join('')}</div>
    <div class="day-row"><label for="obDay" style="font-weight:600">יום</label><select id="obDay">${Array.from({length:31},(_, i) => `<option value="${i+1}" ${OB.due && +OB.due.slice(8)===i+1?'selected':''}>${i+1}</option>`).join('')}</select><span class="muted" style="font-size:14px">לא בטוח/ה? אפשר בערך</span></div>
    <div class="toggle"><span>תאומים או יותר?</span><button type="button" class="switch" id="obTwins" role="switch" aria-checked="${OB.twins}" aria-label="תאומים"></button></div>
    <div class="nav"><button class="btn ghost" id="obBack" aria-label="חזרה">${ic('i-back')}</button><button class="btn primary big" id="obNext" ${OB.due?'':'disabled'}>המשך</button></div>`;
  if (cur === 'wa') body = `${ART.group}<h1>יש קבוצה שמחכה לך</h1>
    <p class="lead">${T("wa_lead", "קבוצת וואטסאפ של נשים עם תאריך משוער ב{month} — מתייעצות, ממליצות ומלוות אחת את השנייה.").replace('{month}', esc(waMonthName(OB.due)))}</p>
    <div class="nav"><button class="btn ghost" id="obBack" aria-label="חזרה">${ic('i-back')}</button><a class="btn primary big" id="obWaJoin" href="${esc(waLinkFor(OB.due))}" target="_blank" rel="noopener">${T("wa_btn", "הצטרפות לקבוצת הווצאפ של משוערות {month}").replace('{month}', esc(waMonthName(OB.due)))}</a></div>
    <div style="text-align:center;margin-top:12px"><button type="button" class="linklike" id="obNext">להמשיך בלי הקבוצה</button></div>
    <p class="tiny">אפשר להצטרף גם אחר כך, מכפתור ההגדרות.</p>`;
  if (cur === 'first') body = `${ART.first}<h1>${T("ob2_title", "זו הלידה הראשונה?")}</h1><p class="lead">${T("ob2_lead", "ככה נדע כמה להסביר, ומה כנראה כבר יש בבית.")}</p>
    <div class="opts"><button type="button" class="opt" data-f="1" aria-pressed="${OB.first}"><span>כן, לידה ראשונה<small>נלווה אתכם צעד־צעד</small></span></button><button type="button" class="opt" data-f="0" aria-pressed="${!OB.first}"><span>כבר יש ילדים בבית<small>אפשר לסמן מהר "כבר יש לי"</small></span></button></div>
    <div class="nav"><button class="btn ghost" id="obBack" aria-label="חזרה">${ic('i-back')}</button><button class="btn primary big" id="obNext">${T("ob2_btn", "בונים את הרשימה")}</button></div><p class="tiny">אפשר לשנות הכול אחר כך.</p>`;
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span>${dots}</div><div class="step">${body}</div>`;
  $('#obBack', el)?.addEventListener('click', () => { OB.step--; renderOnboard(); });
  $$('#obMonths button', el).forEach(b => b.onclick = () => { OB.due = b.dataset.v + '-' + String($('#obDay').value).padStart(2,'0'); renderOnboard(); });
  $('#obDay', el)?.addEventListener('change', e => { if (OB.due) OB.due = OB.due.slice(0,7) + '-' + String(e.target.value).padStart(2,'0'); });
  $('#obTwins', el)?.addEventListener('click', e => { OB.twins = !OB.twins; e.currentTarget.setAttribute('aria-checked', OB.twins); });
  $$('.opt', el).forEach(b => b.onclick = () => { OB.first = b.dataset.f === '1'; $$('.opt', el).forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#obWaJoin', el)?.addEventListener('click', () => { OB.step++; setTimeout(renderOnboard, 0); });
  $('#obNext', el).onclick = () => {
    if (cur !== 'first') { OB.step++; renderOnboard(); return; }
    const editing = !!S.profile;
    S.profile = { due: OB.due, twins: OB.twins, first: OB.first };
    if (editing) { save(); enterApp(); toast('הפרטים עודכנו'); return; }
    ls.set('bl_draft', S);           // הטיוטה נשמרת כבר עכשיו — עוד לפני ההרשמה
    // דניאל, 15.9: בלי מסך ביניים — הכפתור מוביל ישר להתחברות של שופיפיי
    // (הבחירה Google/Shop/מייל קורית שם, פעם אחת), ובחזרה — אוטומטית לרשימה.
    if (USER) { save(); renderBuild(); return; }
    Identity.signIn('direct', S);
  };
}
function editProfile(){ const p = S.profile || {}; OB.step = 1; OB.due = p.due || null; OB.twins = !!p.twins; OB.first = p.first !== false; renderOnboard(); }

/* ---------- 2. "הרשימה נבנית" ---------- */
function renderBuild(){
  showScreen('screen-build');
  const el = $('#screen-build'), w = weeksLeft();
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span></div><div class="step">
    <h1>${T("build_title", "בונים את הרשימה…")}</h1><p class="lead">${w != null && w > 0 ? `עוד ${w} שבועות ללידה. ` : ''}${ITEMS.length} פריטים, ${MODELS.length.toLocaleString('he-IL')} מוצרים עם מחיר, ${Object.keys(STORES).length} חנויות.</p>
    <div class="progress"><i id="buildBar" style="width:0"></i></div><div class="build-list" id="buildList"></div>
    <div class="nav"><button class="btn primary big" id="buildNext" disabled>עוד רגע…</button></div></div>`;
  const list = $('#buildList'), bar = $('#buildBar'), btn = $('#buildNext');
  let i = 0;
  const tick = () => {
    if (i >= ITEMS.length) { bar.style.width = '100%'; btn.disabled = false; btn.textContent = T('build_btn', 'לרשימה שלי'); setTimeout(() => { if (!$('#screen-build').hidden) enterApp(); }, 1200); return; }
    const it = ITEMS[i++]; const n = (modelsByItem[it.id] || []).length;
    const row = document.createElement('div'); row.innerHTML = `<i>✓</i><span>${esc(it.n)}</span><small>${n ? `${n} מוצרים` : ''}</small>`;
    list.prepend(row); while (list.children.length > 9) list.lastChild.remove();
    bar.style.width = Math.round(i / ITEMS.length * 100) + '%';
    setTimeout(tick, 45);
  };
  tick();
  btn.onclick = () => enterApp();
  list.onclick = () => { i = ITEMS.length; };
}

/* ---------- 3. חזרה מהתחברות שלא הושלמה (המסלול הרגיל מדלג על המסך הזה) ---------- */
function renderSignIn(){
  showScreen('screen-signin');
  const el = $('#screen-signin');
  const nSel = Object.values(S.sel).reduce((a, v) => a + v.length, 0), nHave = Object.keys(S.have).length;
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span></div><div class="step">${ART.lock}
    <h1>${T("signin_title", "עוד צעד קטן")}</h1>
    <p class="lead">${T("signin_lead", "התשובות שלכם שמורות. כדי שהרשימה תישמר לתמיד ותחכה לכם מכל מכשיר — מתחברים; בעמוד הבא בוחרים איך: Google, Shop או מייל עם קוד.")}</p>
    <div class="summary-box"><span>תאריך משוער: <b>${esc(dueText())}</b>${S.profile?.twins ? ' · תאומים' : ''}</span><span>${ITEMS.length} פריטים · ${MODELS.length.toLocaleString('he-IL')} מוצרים עם מחיר חי${nSel || nHave ? ` · כבר סומנו ${nSel + nHave}` : ''}</span></div>
    <div class="nav" style="justify-content:center"><button type="button" class="btn primary big" id="btnAuth">${T("signin_btn", "להרשמה / התחברות")}</button></div>
    <p class="tiny">${T("signin_tiny", "בלי סיסמאות. הפרטים לא נמסרים לאף חנות.")}</p>
  </div>`;
  $('#btnAuth', el).onclick = () => Identity.signIn('direct', S);
}

/* =====================================================================
   האפליקציה
   ===================================================================== */
function enterApp(){
  showScreen(null);
  const stale = Object.values(STORES).filter(s => s.stale && !s.hidden), hidden = Object.values(STORES).filter(s => s.hidden);
  const sb = $('#staleBanner'); const parts = [];
  if (hidden.length) parts.push(`המחירים של ${hidden.map(s => s.n).join(', ')} לא מוצגים — לא נבדקו יותר מ-${CONFIG.STALE_HIDE_DAYS} יום.`);
  if (stale.length) parts.push(`חלק מהמחירים נבדקו לפני ${Math.max(...stale.map(s => s.days))} ימים — כדאי לוודא בחנות לפני קנייה.`);
  sb.hidden = !parts.length; sb.textContent = parts.join(' ');
  $('#footNote').innerHTML = `מזהה גרסה: ${VERSION.v}. המחיר הסופי הוא תמיד המחיר באתר החנות.`;
  fixCustomCats();
  renderAll();
  renderRefer();
  refreshGiftClaims().then(changed => { if (changed && UI.view === 'list') renderList(); });
  if (!S.tour) setTimeout(() => { if (!S.tour && $('#modalBg').hidden) openTour(); }, 400);   // פעם אחת לכל חשבון
}

// מוצר שהאמא הוסיפה בעצמה שמור עם שם הקטגוריה. כששם הקטגוריה משתנה, השם הישן
// כבר לא קיים ברשימה — והמוצר היה נעלם מהמסך. מצמידים אותו לשם החדש פעם אחת.
function fixCustomCats(){
  if (!S.custom || !S.custom.length) return;
  const live = new Set(CATS); let changed = false;
  S.custom.forEach(c => { if (c.c && !live.has(c.c) && CAT_NEW[c.c]) { c.c = CAT_NEW[c.c]; changed = true; } });
  if (changed) save();
}

/* ---------- להמליץ לחברה ----------
   הקישור מוביל לכלי עצמו, לא לרשימה האישית — ולכן אפשר לשלוח אותו לכל אחת.
   אותה בנייה כמו קישור המתנות: בתצוגה מקדימה של עותק תמה, הקישור פותח את אותו עותק. */
const REFER_WA_TEXT = T('refer_wa', 'מצאתי כלי שמתכנן את כל הקניות ללידה — רשימה מלאה, מחירים מכל החנויות, והכי זול מסומן. בחינם:');
function toolLink(){
  const url = new URL(location.pathname, CONFIG.STORE_HOME);
  const th = (typeof Shopify !== 'undefined' && Shopify.theme) ? Shopify.theme : null;
  const pt = new URL(location.href).searchParams.get('preview_theme_id') || (th && th.role && th.role !== 'main' && th.id ? String(th.id) : null);
  if (pt) url.searchParams.set('preview_theme_id', pt);
  return url.toString();
}
function renderRefer(){
  const el = $('#refer'); if (!el) return;
  const link = toolLink();
  el.innerHTML = `<div class="refer-card">
    <div class="refer-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.4c0 3.9-4 7-9 7-1 0-2-.1-2.9-.4L4 20l1.2-3.4A6.8 6.8 0 0 1 3 11.4c0-3.9 4-7 9-7s9 3.1 9 7z"/><path d="M12 14.3s-3-1.8-3-3.8a1.55 1.55 0 0 1 3-.55 1.55 1.55 0 0 1 3 .55c0 2-3 3.8-3 3.8z"/></svg></div>
    <h3>המלצה לחבר/ה</h3>
    <p>${T("refer_lead", "מכירים עוד שמתכוננים ללידה ולא יודעים מה לקנות? שלחו להם, שייהנו גם הם מרשימה מלאה, מחירים ותכנון נכון.")}</p>
    <a class="btn refer-wa" id="referWa" href="https://wa.me/?text=${encodeURIComponent(REFER_WA_TEXT + '\n' + link)}" target="_blank" rel="noopener">${T("refer_btn", "לשלוח בוואטסאפ")}</a></div>`;
  el.hidden = false;
}

/* ---------- הדרכה קצרה למשתמשת חדשה (פעם אחת, וגם מההגדרות) ---------- */
const TOUR = [
  { t: 'ככה עובדים עם הרשימה',
    d: 'הרשימה מחולקת לקטגוריות, וכל פריט מסומן חובה / מומלץ / לא חובה. פותחים קטגוריה, ובוחרים פריט שרוצים לטפל בו.',
    img: 'tour1' },
  { t: 'בוחרים מוצר מתוך כל החנויות',
    d: 'לוחצים "בחירת מוצר" ורואים את כל המוצרים המתאימים מכל החנויות — אפשר לחפש, לסנן לפי מותג ולמיין מהזול ליקר.',
    img: 'tour2' },
  { t: 'רואים איפה הכי זול',
    d: 'לחיצה על מוצר פותחת את כל החנויות שמוכרות אותו, עם המחיר בכל אחת. הזול ביותר מסומן, ואפשר לעבור ישר לדף המוצר בחנות.',
    img: 'tour3' },
  { t: 'כמות, מחיר משלכם, ומה שכבר יש',
    d: 'לכל מוצר שנבחר אפשר לקבוע כמות, לעדכן מחיר אם קיבלתם הנחה, לסמן "כבר יש לי", או להסיר.',
    img: 'tour4' },
  { t: 'מה לבקש במתנה',
    d: 'מסמנים מוצר כ"לבקש במתנה", ובלשונית מתנות שולחים קישור בוואטסאפ. מי שמקבל אותו בוחר מה הוא מביא — בלי חשבון — וזה מסומן לכם ברשימה ויורד מהתקציב.',
    img: 'tour5' },
  { t: 'תקציב ופריסה לחודשים',
    d: 'בלשונית תקציב רואים כמה הכל יוצא, לפי קטגוריה ולפי חנות. בלשונית חודשים הקניות מתחלקות על החודשים שנשארו, כך שלא ייצא חודש אחד יקר במיוחד.',
    img: 'tour6' },
];
const TOUR_ART = `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><rect x="24" y="22" width="112" height="116" rx="14" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><rect x="38" y="40" width="60" height="10" rx="5" fill="var(--peach-soft)"/><rect x="38" y="60" width="84" height="8" rx="4" fill="var(--surface-2)"/><rect x="38" y="76" width="70" height="8" rx="4" fill="var(--surface-2)"/><rect x="38" y="98" width="84" height="26" rx="10" fill="var(--peach-soft)"/></svg>`;
let TOUR_STEP = 0;
function openTour(){ TOUR_STEP = 0; renderTour(); }
function renderTour(){
  const st = TOUR[TOUR_STEP], last = TOUR_STEP === TOUR.length - 1;
  const pic = (BL_SETTINGS.img && BL_SETTINGS.img[st.img]) ? `<img class="art tour-img" src="${esc(BL_SETTINGS.img[st.img])}" alt="" loading="lazy">` : TOUR_ART;
  openModal(`<div class="tour-dots" aria-hidden="true">${TOUR.map((_, i) => `<i class="${i === TOUR_STEP ? 'on' : ''}"></i>`).join('')}</div>
    ${pic}
    <h2 style="font-size:21px">${esc(st.t)}</h2>
    <p>${esc(st.d)}</p>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button type="button" class="btn primary" id="tourNext">${last ? 'מתחילים' : 'הבא'}</button>
      ${TOUR_STEP ? '<button type="button" class="btn soft" id="tourPrev">הקודם</button>' : ''}
      <button type="button" class="btn ghost" id="tourSkip" style="margin-inline-start:auto">${last ? 'סגירה' : 'דילוג'}</button>
    </div>
    <p class="why" style="text-align:center;margin:12px 0 0">אפשר לפתוח את ההדרכה שוב בכל שלב, מכפתור ההגדרות למעלה.</p>`);
  $('#tourNext').onclick = () => { if (last) return closeTour(); TOUR_STEP++; renderTour(); };
  $('#tourPrev')?.addEventListener('click', () => { TOUR_STEP--; renderTour(); });
  $('#tourSkip').onclick = closeTour;
}
function closeTour(){
  closeModal();
  if (!S.tour) { S.tour = 1; save(); }              // נשמר בחשבון — לא יקפוץ שוב בשום מכשיר
}
function renderAll(){ renderList(); showView(UI.view); }
function showView(v){ UI.view = v; $$('#tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.view === v)); $$('section.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v)); $('#fabAdd').hidden = v !== 'list'; if (v === 'budget') { renderBudget(); refreshGiftClaims().then(changed => { if (changed && UI.view === 'budget') renderBudget(); }); } if (v === 'months') { renderMonths(); refreshGiftClaims().then(changed => { if (changed && UI.view === 'months') renderMonths(); }); } if (v === 'gifts') { renderGifts(); refreshGiftClaims().then(changed => { if (changed) renderGifts(); }); } if (v === 'list') refreshGiftClaims().then(changed => { if (changed) renderList(); }); window.scrollTo({top:0}); }
$$('#tabs [role=tab]').forEach(b => b.onclick = () => showView(b.dataset.view));
$('#fabAdd').onclick = () => openManual(null);

/* ---------- שורות הרשימה (כל מה שנבחר, מכל הסוגים) ---------- */
function lines(st = S){
  const out = [];
  for (const [iid, picks] of Object.entries(st.sel)) {
    const it = itemById[iid]; if (!it || st.have[iid]) continue;
    for (const p of picks) {
      const m = modelById[p.m]; const o = m && m.offers.find(x => x.sid === p.s);
      if (!m || !o) { out.push({key:'p' + p.id, pick:p, itemId:+iid, item:it, cat:it.c, name:p.name || it.n, store:p.sname || '', price:0, qty:p.q || 1, who:p.who || 'me', missing:true, model:null}); continue; }
      out.push({key:'p' + p.id, pick:p, itemId:+iid, item:it, cat:it.c, name:m.n, brand:m.brand, store:STORES[o.sid].n, sid:o.sid, price:(p.pp != null ? +p.pp : o.p), storeP:o.p, personal:p.pp != null, px:o.px, qty:p.q || 1, who:p.who || 'me', model:m, offer:o, url:o.u, img:m.img});
    }
  }
  for (const c of st.custom) { const it = c.i ? itemById[c.i] : null; if (it && st.have[it.id]) continue; out.push({key:'c' + c.id, custom:c, itemId:c.i || null, item:it, cat:it ? it.c : c.c, name:c.name, store:c.store || 'חנות אחרת', price:+c.price || 0, qty:c.q || 1, who:c.who || 'me', url:c.url, model:null}); }
  return out;
}
const total = ls => ls.reduce((a, l) => a + l.price * l.qty, 0);
const mine = ls => ls.filter(l => l.who === 'me');
/* כמה יחידות באמת נשאר לקנות (הכרעת דניאל, 20.9):
   • "אני קונה"      — הכל.
   • "לבקש במתנה"    — נשאר בתקציב עד שנותן/ת תופס/ת. כל יחידה שנתפסה יורדת בנפרד:
                        סומנו 2 עגלות ונתפסה אחת → אחת נשארת בתקציב. ביטול תפיסה מחזיר אותה מעצמו.
   • "מגיע במתנה"    — לא נספר מלכתחילה (מישהו כבר קונה בוודאות).                            */
const claimedOf = key => (GIFT_CLAIMS_CACHE[key] && GIFT_CLAIMS_CACHE[key].claimed) || 0;
function buyQty(l){
  const q = l.qty || 1;
  if (l.who === 'given') return 0;
  if (l.who === 'gift') return Math.max(0, q - claimedOf(l.key));
  return q;
}
const toBuy = ls => ls.filter(l => buyQty(l) > 0);
const totalBuy = ls => ls.reduce((a, l) => a + l.price * buyQty(l), 0);
const handled = it => (S.sel[it.id]?.length) || S.have[it.id] || S.custom.some(c => c.i === it.id);

function renderHeader(){
  $('#helloTitle').textContent = 'הרשימה שלי';
  const w = weeksLeft();
  $('#helloSub').textContent = w === null ? '' : w > 0 ? `עוד ${w} שבועות · תאריך משוער ${dueText()}` : 'התאריך המשוער עבר — בהצלחה!';
}
function renderHero(){
  const ls_ = lines(), gifts = ls_.filter(l => l.who === 'gift'), done = ITEMS.filter(handled).length, pct = Math.round(done / ITEMS.length * 100);
  const must = ITEMS.filter(i => i.t === 'חובה'), mustDone = must.filter(handled).length, r = 36, c = 2 * Math.PI * r;
  $('#hero').innerHTML = `<div class="ring" role="img" aria-label="${pct}% מהרשימה טופלו"><svg viewBox="0 0 84 84"><circle class="bgc" cx="42" cy="42" r="${r}"/><circle class="fgc" cx="42" cy="42" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct/100)}"/></svg><b class="num">${pct}%</b></div>
    <div class="txt"><h2>${pct === 0 ? 'מתחילים מהחובה' : pct < 100 ? (mustDone === must.length ? 'כל החובה סגורה — יופי!' : 'ממשיכים יפה') : 'הרשימה מלאה!'}</h2><p>${mustDone} מתוך ${must.length} פריטי חובה טופלו</p><div class="stats"><span>נשאר לקנות <b class="num">${nis(totalBuy(ls_))}</b></span><span>במתנה <b class="num">${gifts.length}</b></span></div></div>`;
}
function renderChips(){
  const counts = {all: ITEMS.length, open: ITEMS.filter(i => !handled(i)).length, mine: ITEMS.filter(i => S.sel[i.id]?.length && !S.have[i.id]).length};
  TAG_ORDER.forEach(t => counts[t] = ITEMS.filter(i => i.t === t).length);
  const defs = [['all','הכל'],['open','עוד לא טופל'],['חובה','חובה'],['מומלץ','מומלץ'],['לא חובה','לא חובה'],['mine','מה שנבחר']];
  $('#tagChips').innerHTML = defs.map(([k, t]) => `<button type="button" class="chip" data-f="${k}" aria-pressed="${UI.filter===k}">${t}<span class="n num">${counts[k]}</span></button>`).join('');
  $$('#tagChips .chip').forEach(b => b.onclick = () => { UI.filter = b.dataset.f; renderList(); });
}
function itemMatches(it){
  if (UI.filter === 'mine' && !(S.sel[it.id]?.length && !S.have[it.id])) return false;
  if (UI.filter === 'open' && handled(it)) return false;
  if (TAG_ORDER.includes(UI.filter) && it.t !== UI.filter) return false;
  if (UI.q && !it.n.includes(UI.q) && !it.c.includes(UI.q)) return false;
  return true;
}
function renderList(){
  renderHeader(); renderHero(); renderChips();
  const expandAll = !!UI.q || UI.filter !== 'all';
  $('#cats').innerHTML = CATS.map((cat, idx) => {
    const its = ITEMS.filter(i => i.c === cat), shown = its.filter(itemMatches), extra = S.custom.filter(c => !c.i && c.c === cat && (!UI.q || c.name.includes(UI.q)) && !TAG_ORDER.includes(UI.filter) && UI.filter !== 'open');
    if (!shown.length && !extra.length) return '';
    const done = its.filter(handled).length;
    const open = expandAll || (S.open != null ? S.open === cat : idx === 0);
    return `<div class="cat" data-cat="${esc(cat)}" ${open?'open':''}><button type="button" class="hd" aria-expanded="${open}"><header><span class="ico" style="background:var(--surface-2)">${catIcon(catKey(cat))}</span><span class="t"><h2>${esc(cat)}</h2><span class="prog num">${done === its.length ? '✓ הכול טופל' : `${done} מתוך ${its.length} טופלו`}</span></span><svg class="chev"><use href="#i-chev"/></svg></header></button>
      <div class="bar"><i style="width:${Math.round(done/its.length*100)}%"></i></div><div class="items">${shown.map(renderItem).join('')}${extra.map(renderCustomItem).join('')}</div></div>`;
  }).join('');
  $$('#cats .cat .hd').forEach(b => b.onclick = () => {
    const c = b.closest('.cat'), wasOpen = c.hasAttribute('open');
    if (!expandAll) $$('#cats .cat').forEach(x => { x.removeAttribute('open'); $('.hd', x).setAttribute('aria-expanded','false'); });
    if (!wasOpen) { c.setAttribute('open',''); b.setAttribute('aria-expanded','true'); S.open = c.dataset.cat; c.scrollIntoView({block:'start',behavior:'smooth'}); }
    else { c.removeAttribute('open'); b.setAttribute('aria-expanded','false'); S.open = ''; }
    save();
  });
  bindList();
}
// תמונה: אייקון ברירת-מחדל תמיד מאחור; תמונה שנשברת נעלמת ומשאירה אותו
const hiRes = u => u.replace(/([?&])width=200\b/, '$1width=400');
function thumb(img, cls='', big=false){
  const src = CONFIG.SHOW_IMAGES && img ? (big ? hiRes(img) : img) : '';
  return `<span class="${cls.includes('pic') ? cls : 'thumb ' + cls}">${ic('i-bottle')}${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}</span>`;
}
function priceLabel(o){ return (o.px && o.px > o.p ? 'מ-' : '') + nis(o.p); }   // טווח בתוך חנות → "מ-11.90 ₪"
function modelPriceLabel(m){ const range = (m.nStores > 1 && m.maxP > m.min) || (m.best.px && m.best.px > m.best.p); return (range ? 'מ-' : '') + nis(m.min); }
function storeChip(sid){ const s = STORES[sid]; return s ? `<span class="storechip"><i style="background:${STORE_COLORS[sid]||'var(--muted)'}">${esc(s.n[0])}</i>${esc(s.n)}</span>` : ''; }
function whoRow(key, who){ return `<div class="who" role="group" aria-label="מי קונה">${Object.entries(WHO).map(([k, t]) => `<button type="button" data-who="${k}" data-key="${esc(key)}" aria-pressed="${who===k}">${t}</button>`).join('')}</div>`; }

function renderPick(it, p){
  const m = modelById[p.m], o = m && m.offers.find(x => x.sid === p.s), q = p.q || 1, key = 'p' + p.id;
  if (!m || !o) return `<div class="pick" data-key="${key}"><span class="thumb">${ic('i-bottle')}</span><div class="top"><span><b>${esc(p.name || 'המוצר שנבחר')}</b><span class="v">המוצר הזה כבר לא זמין בחנויות שאנחנו בודקים</span></span></div><div class="row"><button type="button" class="btn small ghost" data-act="remove" data-key="${key}" style="color:var(--rose)">הסרה</button></div></div>`;
  const my = p.pp != null, unit = my ? +p.pp : o.p;
  return `<div class="pick" data-key="${key}">${thumb(m.img)}<div class="top"><span><b>${esc(m.n)}</b><span class="v">${m.brand ? esc(m.brand) + ' · ' : ''}${fmtChecked(STORES[o.sid].d)}${my ? ` · <b style="color:var(--sage)">המחיר שלי</b> · בחנות: ${nis(o.p)}` : ''}</span></span><span class="price num">${q > 1 ? nis(unit * q) : (my ? nis(unit) : priceLabel(o))}<button type="button" class="pedit" data-act="price" data-key="${key}" title="יש לי הנחה — לעדכן מחיר" aria-label="עריכת מחיר">✎</button></span></div>
    <div class="row">${storeChip(o.sid)}<span class="qty" aria-label="כמות"><button type="button" data-act="qty" data-key="${key}" data-d="-1" aria-label="פחות">−</button><span class="num">${q}</span><button type="button" data-act="qty" data-key="${key}" data-d="1" aria-label="יותר">+</button></span>${q > 1 ? `<span class="muted" style="font-size:13px">${my ? nis(unit) : priceLabel(o)} ליח׳</span>` : ''}<a href="${esc(o.u)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600">לחנות</a><button type="button" class="btn small ghost" data-act="remove" data-key="${key}" style="color:var(--rose)">הסרה</button></div>
    ${giftBadge(key, q, true)}${whoRow(key, p.who || 'me')}</div>`;
}
function renderCustomPick(c){
  const key = 'c' + c.id, q = c.q || 1;
  return `<div class="pick" data-key="${key}"><span class="thumb">${ic('i-bottle')}</span><div class="top"><span><b>${esc(c.name)}</b><span class="v">${esc(c.store || 'חנות אחרת')} · הוספה ידנית</span></span><span class="price num">${nis((+c.price || 0) * q)}<button type="button" class="pedit" data-act="price" data-key="${key}" title="עריכת מחיר" aria-label="עריכת מחיר">✎</button></span></div>
    <div class="row"><span class="qty" aria-label="כמות"><button type="button" data-act="qty" data-key="${key}" data-d="-1" aria-label="פחות">−</button><span class="num">${q}</span><button type="button" data-act="qty" data-key="${key}" data-d="1" aria-label="יותר">+</button></span>${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600">לחנות</a>` : ''}<button type="button" class="btn small ghost" data-act="remove" data-key="${key}" style="color:var(--rose)">הסרה</button></div>
    ${giftBadge(key, q, true)}${whoRow(key, c.who || 'me')}</div>`;
}
function renderItem(it){
  const picks = S.sel[it.id] || [], customs = S.custom.filter(c => c.i === it.id), have = !!S.have[it.id], models = modelsByItem[it.id] || [];
  const tags = `<span class="tag ${TAGS[it.t]}">${it.t}</span>` + (it.e ? `<span class="tag early">להזמין מוקדם</span>` : '');
  let body = '';
  if (have) body = `<div class="undo">כבר יש ✓ · <button type="button" class="btn small ghost" data-act="undo" style="padding:2px 8px;color:var(--peach-ink)">להחזיר לרשימה</button></div>`;
  else {
    body = picks.map(p => renderPick(it, p)).join('') + customs.map(renderCustomPick).join('');
    const has = picks.length || customs.length;
    body += `<div class="acts">${models.length ? `<button type="button" class="btn ${has ? 'soft' : 'primary'} small" data-act="models">${has ? ic('i-plus') + ' מוצר נוסף' : (models.length === 1 ? 'לראות את המוצר' : `בחירת מוצר <span class="num" style="opacity:.8">(${models.length})</span>`)}</button>` : `<button type="button" class="btn ghost small" data-act="manual">מוצר משלי</button>`}${!has ? `<button type="button" class="btn soft small" data-act="have">כבר יש לי</button>` : ''}</div>`;
    if (!has) {
      if (!models.length) body += `<div class="nomodels">אין כרגע מחיר עדכני לפריט הזה — אפשר להוסיף מוצר משלכם.</div>`;
      else if (models.length === 1 && models[0].nStores === 1) body += `<div class="nomodels">מוצר אחד, בחנות אחת — בלי השוואת מחיר.</div>`;
      else body += `<div class="nomodels">${models.length === 1 ? 'מוצר אחד' : `הכי זול: ${modelPriceLabel(models[0])}`}${defaultQty(it) > 1 ? ` · מומלץ ${defaultQty(it)} יח׳` : ''}</div>`;
    }
  }
  return `<div class="item ${have?'have':(picks.length || customs.length ?'done':'')}" data-id="${it.id}"><button type="button" class="st" data-act="${have?'undo':'have'}" aria-label="כבר יש לי">${(have || picks.length || customs.length) ? ic('i-check') : ''}</button>
    <div class="main"><div class="name">${esc(it.n)}</div><div class="tags">${tags}</div>${body}</div></div>`;
}
function renderCustomItem(c){
  return `<div class="item done" data-custom="${c.id}"><span class="st" style="background:var(--sage);border-color:var(--sage)">${ic('i-check')}</span><div class="main"><div class="name">${esc(c.name)}</div><div class="tags"><span class="tag opt">פריט שהוספתם</span></div>${renderCustomPick(c)}</div></div>`;
}
function findByKey(key){
  if (key[0] === 'c') return { custom: S.custom.find(c => 'c' + c.id === key) };
  for (const [iid, picks] of Object.entries(S.sel)) { const p = picks.find(x => 'p' + x.id === key); if (p) return { pick:p, iid:+iid, picks }; }
  return {};
}
function bindList(){
  $$('#cats [data-act]').forEach(b => b.onclick = () => {
    const act = b.dataset.act, key = b.dataset.key, itemEl = b.closest('[data-id]'), id = itemEl ? +itemEl.dataset.id : null;
    if (act === 'have') { S.have[id] = true; save(); rerenderItem(id); toast('סומן: כבר יש ✓'); }
    else if (act === 'undo') { delete S.have[id]; save(); rerenderItem(id); toast('חזר לרשימה'); }
    else if (act === 'models') { const ms = modelsByItem[id] || []; if (ms.length === 1) openModel(ms[0].id); else openModels(id); }
    else if (act === 'manual') openManual(id);
    else if (act === 'price') openPriceEdit(key, id);
    else if (act === 'remove') { const f = findByKey(key); if (f.custom) S.custom = S.custom.filter(c => c !== f.custom); else if (f.pick) { S.sel[f.iid] = f.picks.filter(p => p !== f.pick); if (!S.sel[f.iid].length) delete S.sel[f.iid]; } save(); id != null ? rerenderItem(id) : renderList(); toast('הוסר מהרשימה'); }
    else if (act === 'qty') { const f = findByKey(key), t = f.custom || f.pick; if (!t) return; t.q = Math.max(1, (t.q||1) + +b.dataset.d); save(); id != null ? rerenderItem(id) : renderList(); }
  });
  $$('#cats [data-who]').forEach(b => b.onclick = () => {
    const f = findByKey(b.dataset.key), t = f.custom || f.pick; if (!t) return; t.who = b.dataset.who; save();
    const itemEl = b.closest('[data-id]'); itemEl ? rerenderItem(+itemEl.dataset.id) : renderList();
    if (t.who === 'gift') toast('עבר לרשימת המתנות');
  });
}
function rerenderItem(id){
  const el = $(`#cats .item[data-id="${id}"]`); if (!el) return renderList();
  const tmp = document.createElement('div'); tmp.innerHTML = renderItem(itemById[id]); el.replaceWith(tmp.firstElementChild);
  const cat = $(`#cats .cat[data-cat="${CSS.escape(itemById[id].c)}"]`);
  if (cat) { const its = ITEMS.filter(i => i.c === itemById[id].c), done = its.filter(handled).length; $('.prog', cat).textContent = done === its.length ? '✓ הכול טופל' : `${done} מתוך ${its.length} טופלו`; $('.bar i', cat).style.width = Math.round(done/its.length*100) + '%'; }
  renderHero(); renderChips(); bindList();
}
$('#search').oninput = e => { UI.q = e.target.value.trim(); renderList(); };

/* ---------- חלון / גיליון ---------- */
let lastFocus = null;
function trap(c){ c.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); c.id === 'modal' ? closeModal() : closeSheet(); } if (e.key !== 'Tab') return; const f = $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])', c).filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return; const a = f[0], z = f[f.length-1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }); }
function openModal(html){ lastFocus = document.activeElement; $('#modal').innerHTML = html; $('#modalBg').hidden = false; document.body.style.overflow='hidden'; setTimeout(() => $$('button,input,select', $('#modal'))[0]?.focus(), 0); }
function closeModal(){ $('#modalBg').hidden = true; document.body.style.overflow=''; lastFocus?.focus?.(); }
function openSheet(html){ lastFocus = document.activeElement; $('#sheet').innerHTML = `<div class="grab"></div>` + html; $('#sheetBg').hidden = false; document.body.style.overflow='hidden'; $('#sheet .body').scrollTop = 0; setTimeout(() => $('#sheet .head button')?.focus(), 0); }
function closeSheet(){ $('#sheetBg').hidden = true; document.body.style.overflow=''; lastFocus?.focus?.(); }
trap($('#modal')); trap($('#sheet'));
$('#sheetBg').addEventListener('click', e => { if (e.target === $('#sheetBg')) closeSheet(); });
$('#modalBg').addEventListener('click', e => { if (e.target === $('#modalBg')) closeModal(); });

/* ---------- גלריית המוצרים של פריט ---------- */
const MS = { item:null, brand:'all', sort:'cheap', q:'', page:1, scroll:0, pick:null };
// pick = מצב סימון מרובה (מנהל): מערך מזהים לפי סדר הבחירה. הסדר חשוב באיחוד —
// המוצר הראשון שנבחר הוא זה שנשאר, והאחרים נבלעים לתוכו ומשאירים כינוי.
// keep=true — חזרה מכרטיס מוצר: אותו מסנן, אותו חיפוש, אותה כמות שנטענה, ואותו מקום בגלילה.
// פתיחה רגילה של פריט מהרשימה תמיד מתחילה נקי.
function openModels(itemId, keep){
  const same = !!keep && MS.item === itemId;
  const st = same ? { brand:MS.brand, sort:MS.sort, q:MS.q, page:MS.page, scroll:MS.scroll || 0 }
                  : { brand:'all', sort:'cheap', q:'', page:1, scroll:0 };
  MS.item = itemId; MS.brand = st.brand; MS.sort = st.sort; MS.q = st.q; MS.page = st.page; MS.scroll = st.scroll;
  if (!same) MS.pick = null;
  const sortOpt = (v, t) => `<option value="${v}"${MS.sort === v ? ' selected' : ''}>${t}</option>`;
  openSheet(`<div class="head"><div><h2>${esc(itemById[itemId].n)}</h2><div class="sub" id="msSub"></div></div><button type="button" class="btn soft small" data-close>סגירה</button></div>
    <div class="body" id="msBody"><div class="toolbar"><div class="searchbox"><input id="msQ" type="search" placeholder="חיפוש מוצר או מותג…" aria-label="חיפוש מוצר" value="${esc(MS.q)}"><svg><use href="#i-search"/></svg></div><select id="msSort" aria-label="מיון">${sortOpt('cheap','מהזול ליקר')}${sortOpt('exp','מהיקר לזול')}${sortOpt('stores','קודם מה שבכמה חנויות')}${sortOpt('brand','לפי מותג')}</select></div>
    <div class="chips" id="msBrands"></div>${IS_ADMIN ? `<div class="row-btns" id="msAdminBar" style="margin-bottom:8px"></div>` : ''}<div id="msList"></div></div>`);
  $('[data-close]', $('#sheet')).onclick = closeSheet;
  $('#msQ').oninput = e => { MS.q = e.target.value.trim().toLowerCase(); MS.page = 1; MS.scroll = 0; renderModels(); };
  $('#msSort').onchange = e => { MS.sort = e.target.value; MS.page = 1; MS.scroll = 0; renderModels(); };
  renderModels();
  // השחזור אחרי הציור; פעם שנייה ב-rAF כי גובה הכרטיסים נקבע אחרי הפריסה הראשונה
  if (st.scroll) { const b = $('#msBody'); if (b) { b.scrollTop = st.scroll; requestAnimationFrame(() => { b.scrollTop = st.scroll; }); } }
}
function renderModels(){
  const all = (modelsByItem[MS.item] || []), byB = {}; all.forEach(m => { if (m.brand) byB[m.brand] = (byB[m.brand]||0) + 1; });
  const brands = Object.entries(byB).sort((a, b) => b[1] - a[1]).slice(0, 15);
  $('#msBrands').innerHTML = brands.length > 1 ? `<button type="button" class="chip" data-b="all" aria-pressed="${MS.brand==='all'}">כל המותגים<span class="n num">${all.length}</span></button>` + brands.map(([v, n]) => `<button type="button" class="chip" data-b="${esc(v)}" aria-pressed="${MS.brand===v}">${esc(v)}<span class="n num">${n}</span></button>`).join('') : '';
  $$('#msBrands .chip').forEach(b => b.onclick = () => { MS.brand = b.dataset.b; MS.page = 1; renderModels(); });
  const ms = all.filter(m => (MS.brand === 'all' || m.brand === MS.brand) && (!MS.q || (m.n + ' ' + m.brand).toLowerCase().includes(MS.q)));
  const sorters = { cheap: (a, b) => a.min - b.min, exp: (a, b) => b.min - a.min, brand: (a, b) => (a.brand || 'ת').localeCompare(b.brand || 'ת', 'he') || a.min - b.min, stores: (a, b) => b.nStores - a.nStores || a.min - b.min };
  ms.sort(sorters[MS.sort]);
  const multi = all.filter(m => m.nStores > 1).length;
  $('#msSub').textContent = `${ms.length} מוצרים${brands.length > 1 ? ` · ${Object.keys(byB).length} מותגים` : ''}${multi ? ` · ${multi} בכמה חנויות` : ''}`;
  const shown = ms.slice(0, MS.page * CONFIG.MODELS_PAGE);
  $('#msList').innerHTML = (shown.length ? `<div class="mgrid">${shown.map(m => `<button type="button" class="mcard" data-m="${esc(m.id)}">${IS_ADMIN ? `<span class="mcard-x" title="להסיר את המוצר מכולן" data-mx="${esc(m.id)}">✕</span>` : ''}${thumb(m.img, 'pic', true)}<span class="t">${esc(m.n)}</span><span class="v">${esc(m.brand || '')}${m.cl?.length ? `${m.brand ? ' · ' : ''}${m.cl.length} צבעים` : ''}${!m.best.a ? `${m.brand || m.cl?.length ? ' · ' : ''}<span class="unavail">לבדוק זמינות</span>` : ''}</span><span class="pl"><span class="p num">${modelPriceLabel(m)}</span><span class="s ${m.nStores>1?'multi':''}">${m.nStores > 1 ? `ב-${m.nStores} חנויות` : esc(STORES[m.best.sid].n)}</span></span></button>`).join('')}</div>` : `<p class="notice">לא נמצאו מוצרים שמתאימים לחיפוש הזה.${(MS.q || MS.brand !== 'all') ? ` <button type="button" class="btn ghost small" id="msReset" style="margin-inline-start:6px">ניקוי החיפוש</button>` : ''}</p>`)
    + (ms.length > shown.length ? `<button type="button" class="more" id="msMore">להציג עוד ${Math.min(CONFIG.MODELS_PAGE, ms.length - shown.length)} מתוך ${ms.length - shown.length}</button>` : '')
    + (IS_ADMIN && (hiddenByItem[MS.item] || []).length ? `<p class="admin-hint">הסרת ${(hiddenByItem[MS.item] || []).length} מוצרים מהפריט הזה — הנשים לא רואות אותם. <button type="button" class="btn ghost small" id="msRemoved">לצפייה והחזרה</button></p>` : '');
  // המקום בגלילה נשמר לפני הכניסה למוצר — כדי לחזור בדיוק לאותה נקודה
  $$('#msList .mcard').forEach(b => b.onclick = () => { MS.scroll = $('#msBody')?.scrollTop || 0; openModel(b.dataset.m); });
  $('#msReset')?.addEventListener('click', () => { MS.q = ''; MS.brand = 'all'; MS.page = 1; MS.scroll = 0; const q = $('#msQ'); if (q) q.value = ''; renderModels(); });
  $('#msRemoved')?.addEventListener('click', () => adminRemovedList(MS.item));
  // שתי הקשות: הראשונה מבקשת אישור, השנייה מסירה — כדי שהקשה בטעות בנייד לא תוריד מוצר.
  $$('#msList [data-mx]').forEach(x => x.onclick = e => {
    e.stopPropagation();
    if (x.dataset.armed) { adminRemove(x.dataset.mx); return; }
    $$('#msList [data-mx]').forEach(o => { delete o.dataset.armed; o.textContent = '✕'; o.classList.remove('armed'); });
    x.dataset.armed = '1'; x.textContent = 'להסיר?'; x.classList.add('armed');
    setTimeout(() => { if (x.dataset.armed) { delete x.dataset.armed; x.textContent = '✕'; x.classList.remove('armed'); } }, 3000);
  });
  $('#msMore')?.addEventListener('click', () => { MS.page++; renderModels(); });
  renderPickBar();
  if (MS.pick) {
    $$('#msList .mcard').forEach(b => { const on = MS.pick.includes(b.dataset.m); b.classList.toggle('picked', on);
      b.onclick = e => { e.preventDefault(); togglePick(b.dataset.m); }; });
    $$('#msList [data-mx]').forEach(x => x.remove());          // בלי הסרה בטעות בזמן סימון
  }
}
/* ---------- סימון מרובה (מנהל): העברה קבוצתית ואיחוד ---------- */
function renderPickBar(){
  const bar = $('#msAdminBar'); if (!bar) return;
  if (!MS.pick) {
    bar.innerHTML = `<button type="button" class="btn soft small" id="msPickOn">סימון מרובה — לאיחוד או להעברה</button>`;
    $('#msPickOn').onclick = () => { MS.pick = []; renderModels(); };
    return;
  }
  const n = MS.pick.length;
  bar.innerHTML = `<span class="st-s" style="font-weight:700;align-self:center">נבחרו ${n}</span>
    <button type="button" class="btn soft small" id="msPickMove" ${n ? '' : 'disabled'}>העברה לתת-קטגוריה אחרת</button>
    <button type="button" class="btn soft small" id="msPickMerge" ${n >= 2 && n <= 3 ? '' : 'disabled'}>זה אותו מוצר — לאחד</button>
    <button type="button" class="btn ghost small" id="msPickOff">ביטול סימון</button>`;
  $('#msPickOff').onclick = () => { MS.pick = null; renderModels(); };
  $('#msPickMove').onclick = () => pickMove();
  $('#msPickMerge').onclick = () => pickMerge();
}
function togglePick(id){
  if (!MS.pick) return;
  const i = MS.pick.indexOf(id);
  if (i >= 0) MS.pick.splice(i, 1); else MS.pick.push(id);
  MS.scroll = $('#msBody')?.scrollTop || MS.scroll;
  renderModels();
  const b = $('#msBody'); if (b && MS.scroll) b.scrollTop = MS.scroll;
}
function pickMove(){
  const ids = (MS.pick || []).slice(); if (!ids.length) return;
  openModal(`<h2>העברת ${ids.length} מוצרים</h2><p style="font-size:14px">לאיזו תת-קטגוריה להעביר אותם? ההעברה חלה על כל הנשים, ואפשר להחזיר אותה מכאן בכל רגע.</p>
    <div class="field"><label for="admItem">תת-קטגוריה</label><select id="admItem">${ITEMS.map(it => `<option value="${it.id}"${it.id === MS.item ? ' selected' : ''}>${esc(it.c)} — ${esc(it.n)}</option>`).join('')}</select></div>
    <ul style="font-size:13.5px;margin:0 0 12px;padding-inline-start:18px">${ids.map(id => `<li>${esc((modelById[id] || {}).n || id)}</li>`).join('')}</ul>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">העברה</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admSave').onclick = async () => {
    const target = +$('#admItem').value;
    ids.forEach(id => setOverride(id, { item: target === ((RAW_MODELS || []).find(x => x.id === id) || {}).i ? null : target }));
    MS.pick = null; closeModal();
    prepareData(); renderList(); refreshGallery();          // הגלריה מתעדכנת מיד — המוצרים כבר לא כאן
    toast((await saveOverrides()) ? `${ids.length} מוצרים הועברו ל"${esc((itemById[target] || {}).n || '')}"` : 'ההעברה מוצגת אצלך, אבל השמירה נכשלה — לנסות שוב' + saveErrNote());
  };
}
function pickMerge(){
  const ids = (MS.pick || []).slice(); if (ids.length < 2 || ids.length > 3) return;
  // מוצר שכבר בקבוצת איחוד קיימת — שתי קבוצות חופפות היו נדחות בבנייה הלילית
  const joined = new Set((OVERRIDES.merge || []).flat());
  const clash = ids.filter(id => joined.has(id));
  if (clash.length) return toast('אחד המוצרים כבר אוחד — אפשר לבטל את האיחוד הקודם במסך "מצב הכלי"');
  const keep = modelById[ids[0]] || {};
  const sameStore = new Set(ids.flatMap(id => (modelById[id] || {}).offers?.map(o => o.sid) || []));
  const totalOffers = ids.reduce((a, id) => a + ((modelById[id] || {}).offers || []).length, 0);
  openModal(`<h2>איחוד ${ids.length} מוצרים</h2>
    <p style="font-size:14px">הם יוצגו כשורה אחת עם השוואת מחירים בין החנויות. <b>השורה שנשארת: "${esc(keep.n || ids[0])}"</b> — זה המוצר שסימנת ראשון, והשם שלו הוא שיוצג.</p>
    ${totalOffers > sameStore.size ? `<p class="notice" style="margin:0 0 12px">שניים מהם נמכרים באותה חנות — במקרה כזה נשמר המחיר של השורה שנשארת.</p>` : ''}
    <ul style="font-size:13.5px;margin:0 0 12px;padding-inline-start:18px">${ids.map((id, i) => `<li>${esc((modelById[id] || {}).n || id)}${i ? '' : ' <b>(נשאר)</b>'}</li>`).join('')}</ul>
    <p class="why">האיחוד נכנס לקובץ בעדכון הלילי. אפשר לבטל אותו במסך "מצב הכלי", תחת "מוצרים שאיחדת".</p>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">לאחד</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admSave').onclick = async () => {
    (OVERRIDES.merge = OVERRIDES.merge || []).push(ids);
    MS.pick = null; closeModal();
    prepareData(); renderList(); refreshGallery();          // השורה המאוחדת מופיעה מיד בגלריה
    toast((await saveOverrides()) ? `אוחדו ל"${esc((modelById[ids[0]] || {}).n || '')}"` : 'השמירה נכשלה — לנסות שוב' + saveErrNote());
  };
}

/* ---------- מוצר אחד: השוואת המחירים בין החנויות ---------- */
function openModel(mid){
  const m = modelById[mid], it = itemById[m.i], picks = S.sel[it.id] || [];
  const many = m.offers.length > 1, nMin = m.offers.filter(o => o.p === m.min).length, allSame = nMin === m.offers.length;
  const body = m.offers.map(o => {
    const isBest = many && !allSame && o.p === m.min, diff = o.p - m.min, chosen = picks.some(p => p.m === m.id && p.s === o.sid);
    return `<div class="store ${isBest?'best':''}"><div class="l1"><span class="sc">${storeChip(o.sid)}${isBest ? '<span class="tag best">הכי זול</span>' : ''}${chosen ? '<span class="tag early">ברשימה</span>' : ''}</span><span class="p num">${priceLabel(o)}</span></div>
      <div class="meta"><span>${o.byHand ? 'מחיר שהוזן ידנית — יתעדכן כשהסריקה תמצא את המוצר' : fmtChecked(STORES[o.sid].d)}${!o.byHand && STORES[o.sid].stale ? ' ⚠️' : ''}</span>${isBest && m.maxP > m.min ? `<span style="color:var(--sage);font-weight:700">חיסכון של ${nis(m.maxP - m.min)} לעומת היקרה</span>` : (diff > 0 ? `<span>+${nis(diff)} מהזול</span>` : '')}${!o.a ? `<span class="unavail">לא מסומן במלאי — לבדוק בחנות</span>` : ''}${o.px && o.px > o.p ? `<span>טווח: ${nis(o.p)}–${nis(o.px)} לפי גודל/גרסה</span>` : ''}</div>
      <div class="acts"><button type="button" class="btn primary small" data-add="${esc(o.sid)}">${chosen ? 'להוסיף שוב' : 'הוספה לרשימה'}</button><a class="btn soft small" href="${esc(o.u)}" target="_blank" rel="noopener">לדף המוצר</a></div></div>`; }).join('');
  openSheet(`<div class="head"><div><h2 style="font-size:18px">${esc(m.n)}</h2><div class="sub">${m.brand ? esc(m.brand) + ' · ' : ''}${esc(it.n)}</div></div><button type="button" class="btn soft small" data-back>${(modelsByItem[it.id].length > 1) ? ic('i-back') + ' למוצרים' : 'סגירה'}</button></div>
    <div class="body">${thumb(m.img, 'lg', true)}${m.cl?.length ? `<div class="colors">${m.cl.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
    ${many ? (allSame ? `<p class="notice" style="margin:0 0 12px">אותו מחיר ב-${m.offers.length} החנויות.</p>` : `<p class="notice info" style="margin:0 0 12px">נמכר ב-${m.offers.length} חנויות — המחיר הזול ביותר מסומן.</p>`) : `<p class="notice" style="margin:0 0 12px">נמצא בחנות אחת בלבד, אין השוואה.</p>`}${body}${adminBox(m)}</div>`);
  $('[data-back]', $('#sheet')).onclick = () => (modelsByItem[it.id].length > 1) ? openModels(it.id, true) : closeSheet();
  $$('[data-add]', $('#sheet')).forEach(b => b.onclick = () => {
    const o = m.offers.find(x => x.sid === b.dataset.add);
    // נשמרים גם שם המוצר ושם החנות — כדי שאם המזהה ייעלם, נוכל להגיד "כבר לא זמין" (מסמך 23 פרק 6)
    (S.sel[it.id] ||= []).push({ id: uid(), m: m.id, s: o.sid, q: picks.length ? 1 : defaultQty(it), who:'me', name: m.n, sname: STORES[o.sid].n, i: it.id });
    delete S.have[it.id];
    save(); closeSheet(); rerenderItem(it.id); toast(`נוסף מ${STORES[o.sid].n} ✓`);
    $(`#cats .item[data-id="${it.id}"]`)?.scrollIntoView({block:'nearest'});
  });
  if (IS_ADMIN) {
    $('[data-adm="hide"]', $('#sheet'))?.addEventListener('click', () => { closeSheet(); (m.adminHidden ? adminRestore : adminRemove)(m.id); });
    $('[data-adm="rename"]', $('#sheet'))?.addEventListener('click', () => adminRename(m));
    $('[data-adm="move"]', $('#sheet'))?.addEventListener('click', () => adminMove(m));
    $('[data-adm="img"]', $('#sheet'))?.addEventListener('click', () => adminImage(m));
    $('[data-adm="compare"]', $('#sheet'))?.addEventListener('click', () => adminCompare(m));
    $$('[data-admhs]', $('#sheet')).forEach(b => b.onclick = () => { const hs = [...(ovOf(m.id).hs || []), b.dataset.admhs]; closeSheet(); adminApply(m.id, {hs}, 'החנות הוסתרה מהמוצר הזה'); });
    $$('[data-admrs]', $('#sheet')).forEach(b => b.onclick = () => { const hs = (ovOf(m.id).hs || []).filter(s => s !== b.dataset.admrs); closeSheet(); adminApply(m.id, {hs}, 'החנות הוחזרה ✓'); });
    $$('[data-admurl]', $('#sheet')).forEach(b => b.onclick = () => adminEditUrl(m, b.dataset.admurl));
    $$('[data-admsplit]',   $('#sheet')).forEach(b => b.onclick = () => adminSplit(m, b.dataset.admsplit));
    $$('[data-admunsplit]', $('#sheet')).forEach(b => b.onclick = () => adminUnsplit(m, b.dataset.admunsplit));
  }
}

// תמונה שופיפי אמיתית: או מ-cdn.shopify.com, או מדומיין החנות עצמה עם נתיב /cdn/shop/
// (כך מעתיקים תמונה מדף מוצר בפועל — קליק ימני → העתקת כתובת התמונה)
function isShopifyImg(v){
  return /^https:\/\/cdn\.shopify\.com\//.test(v) || /^https:\/\/[^/]+\/cdn\/shop\/(files|products)\//.test(v);
}
/* ---------- מסכי העריכה של המנהל ---------- */
/* ---------- הסרת מוצר (מנהל) ----------
   אי אפשר למחוק מוצר מהחנות עצמה — הסריקה הלילית מוצאת אותו שוב בכל פעם.
   ההסרה כאן היא רשומת תיקון קבועה: build_bundle משמיט את המוצר מהקובץ
   המתפרסם, כך שאף אישה לא רואה אותו — לא היום ולא אחרי סריקות הבאות.
   הרשימה המרכזית למטה היא המקום היחיד שבו הוא עדיין קיים, וממנה מחזירים. */
function refreshGallery(){ if (!$('#sheetBg').hidden && $('#msList') && MS.item) renderModels(); }
function adminRemove(mid){
  const m = modelById[mid]; if (!m) return;
  adminApply(mid, {hide: 1}, `"${m.n}" הוסר — הנשים כבר לא רואות אותו`);
  refreshGallery();
}
function adminRestore(mid){
  const m = modelById[mid]; if (!m) return;
  adminApply(mid, {hide: null}, `"${m.n}" הוחזר ✓`);
  refreshGallery();
}
function adminRemovedList(onlyItem){
  const groups = {};
  for (const [iid, list] of Object.entries(hiddenByItem)) {
    if (onlyItem && +iid !== +onlyItem) continue;
    if (list.length) groups[iid] = list;
  }
  const ids = Object.keys(groups).sort((a, b) => ((itemById[a] || {}).n || '').localeCompare(((itemById[b] || {}).n || ''), 'he'));
  const total = ids.reduce((n, iid) => n + groups[iid].length, 0);
  const body = ids.map(iid => `<div class="ttl" style="margin-top:14px">${esc((itemById[iid] || {}).n || ('פריט ' + iid))}</div>` +
    groups[iid].map(m => `<div class="adm-store" style="flex-wrap:wrap"><div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600">${esc(m.n)}</div>
      <div style="font-size:12px;color:var(--muted)">${esc(m.brand || '')}${m.brand ? ' · ' : ''}${esc(STORES[m.best.sid] ? STORES[m.best.sid].n : m.best.sid)} · ${esc(modelPriceLabel(m))}</div></div>
      <button type="button" class="btn ghost small" data-rview="${esc(m.id)}">לצפייה</button>
      <button type="button" class="btn soft small" data-rback="${esc(m.id)}">להחזיר</button></div>`).join('')).join('');
  openModal(`<h2>מוצרים שהסרתי</h2>
    <p style="font-size:14px">${total
      ? `${total} מוצרים שהסרת${onlyItem ? ' מהפריט הזה' : ''}. הם מושמטים לגמרי מהקובץ שהנשים רואות — אפשר להחזיר כל אחד מהם מכאן.`
      : 'עוד לא הסרת אף מוצר.'}</p>${body}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${onlyItem ? '<button type="button" class="btn ghost small" id="rmAll">כל הפריטים</button>' : ''}<button type="button" class="btn soft" id="rmClose">סגירה</button></div>
    <div class="admin-hint">ההסרה נשמרת מיד ונכנסת לקובץ של כולן בעדכון הלילי. היא נשארת בתוקף גם אחרי סריקות הבאות — הסריקה תמצא את המוצר שוב בחנות, וההסרה הזו היא שמשאירה אותו בחוץ.</div>`);
  $('#rmClose').onclick = closeModal;
  $('#rmAll')?.addEventListener('click', () => adminRemovedList(null));
  $$('[data-rback]', $('#modal')).forEach(b => b.onclick = () => { closeModal(); adminRestore(b.dataset.rback); });
  $$('[data-rview]', $('#modal')).forEach(b => b.onclick = () => { closeModal(); openModel(b.dataset.rview); });
}
/* ---------- מצב הכלי (מנהל) ----------
   הכל במקום אחד: הריצות האחרונות (מתוך bl_health.json, שנכתב בכל ריצה — גם
   כשהיא נופלת), מצב הסריקה של כל חנות, מה שממתין להכרעה ומה שנעלם מהחנויות
   (מתוך bl_admin.json). הכפתורים שמתקנים כבר ממילא כאן, ולכן גם המסך כאן. */
let ADMIN_DOC = null, HEALTH_DOC = null;
const STEP_HE = {'offline-suite':'בדיקת המנוע', 'bundle-tests':'בדיקות החבילה',
                 'live-refresh':'סריקת החנויות', 'publish':'הפרסום'};
const whenHe = iso => {
  const d = daysAgo(iso);
  const t = new Date(iso).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'});
  return (d <= 0 ? 'היום' : d === 1 ? 'אתמול' : fmtDate(iso)) + ' ' + t;
};
async function loadAdminFiles(){
  const get = async n => {
    try { const r = await fetch(CONFIG.DATA_BASE + n + '?t=' + Date.now(), {cache:'no-store'});
          return r.ok ? await r.json() : null; } catch(e) { return null; }
  };
  [ADMIN_DOC, HEALTH_DOC] = await Promise.all([get('bl_admin.json'), get('bl_health.json')]);
}
function adminStatus(){
  openModal(`<h2>מצב הכלי</h2><p style="font-size:14px">טוען…</p>`);
  loadAdminFiles().then(renderStatus);
}
function statusRuns(){
  const runs = (HEALTH_DOC && HEALTH_DOC.runs) || [];
  if (!runs.length) return '<p class="admin-hint">אין עדיין היסטוריית ריצות — היא נצברת מהרענון הבא.</p>';
  const bad = runs.slice(0, 10).filter(r => !r.ok).length;
  return (bad ? `<p style="font-size:13px;color:var(--rose);margin:4px 0 0">${bad} מתוך 10 הריצות האחרונות נכשלו.</p>`
              : '<p style="font-size:13px;color:var(--sage);margin:4px 0 0">כל 10 הריצות האחרונות הצליחו.</p>')
    + runs.slice(0, 10).map(r => `<div class="st-row"><span class="st-dot">${r.ok ? '✅' : '⚠️'}</span>
      <div class="st-main"><div class="st-t">${esc(whenHe(r.at))}${r.trigger === 'schedule' ? ' · אוטומטי' : ' · הופעל ידנית'}</div>
      ${r.ok
        ? `<div class="st-s">${r.counts ? `${r.counts.models} מוצרים · ${r.counts.offers} מחירים` : 'פורסם'}</div>`
        : `<div class="st-err">נפל ב${esc(STEP_HE[r.step] || r.step || 'שלב לא ידוע')} — ${esc(r.error || 'בלי פירוט')}</div>`}</div>
      ${r.url ? `<a class="btn ghost small" href="${esc(r.url)}" target="_blank" rel="noopener">ללוג</a>` : ''}</div>`).join('');
}
function statusStores(){
  return Object.values(STORES).map(s => {
    const d = daysAgo(s.d);
    const cls = s.hidden ? 'st-err' : (s.stale ? 'st-err' : 's-ok');
    return `<div class="st-row"><span class="st-dot">${s.hidden ? '⚠️' : s.stale ? '🕓' : '✅'}</span>
      <div class="st-main"><div class="st-t">${esc(s.n)}</div>
      <div class="${cls === 's-ok' ? 'st-s' : 'st-err'}">${esc(fmtChecked(s.d))}${s.p ? ` · ${s.p} מוצרים` : ''}${
        s.hidden ? ` — המחירים שלה כבר לא מוצגים` : s.stale ? ' — כדאי לסרוק' : ''}</div></div></div>`;
  }).join('');
}
// Shops whose full listing Daniel asked to see. A row can hold 50 listings, so each
// shop shows its two ends until he opens it. Deliberately not persisted: it is a
// glance, not a decision.
const RQ_OPEN = new Set();
function dropsOf(id){ return new Set(((OVERRIDES.drop || {})[id]) || []); }
function liveEx(r){ const d = dropsOf(r.id); return (r.ex || []).filter(e => !d.has(e.k)); }
function shopKeys(id, sid){
  const r = ((ADMIN_DOC && ADMIN_DOC.review) || []).find(x => x.id === id);
  return r ? liveEx(r).filter(e => e.s === sid).map(e => e.k) : [];
}
// A decision is saved the moment it is made, but bl_admin.json is rebuilt once a night,
// so until then it still lists rows he has already answered. Reading that list without
// reading his answers is why a ruled row came back every time he reopened the screen
// (19.9). These two are the only doors the screen reads the queue through.
function openReview(){
  const done = OVERRIDES.review || {};
  return ((ADMIN_DOC && ADMIN_DOC.review) || []).filter(r => !done[r.id]);
}
function openPairs(){
  const no = new Set(OVERRIDES.notmerge || []), joined = new Set();
  (OVERRIDES.merge || []).forEach(g => g.forEach(id => joined.add(id)));
  return ((ADMIN_DOC && ADMIN_DOC.pairs) || [])
    .filter(r => !no.has(r.k) && !joined.has(r.a.id) && !joined.has(r.b.id));
}
function statusQueue(){
  const q = openReview();
  if (!ADMIN_DOC) return '<p class="admin-hint">לא הצלחתי לטעון את קובץ הבדיקה.</p>';
  if (!q.length) return '<p style="font-size:13px;margin:4px 0 0">אין דגמים שממתינים לך. ✓</p>';
  return `<p style="font-size:13px;margin:4px 0 8px">המנוע חושב שאלה אותו מוצר בכמה חנויות, אבל הפרש המחירים גדול מדי בשביל להיות בטוח — אז הוא מחכה לך. אם חנות אחת או מוצר אחד פשוט לא שייכים לכאן, אפשר להוציא אותם ב-"לא שייך" — הם יהפכו לשורה נפרדת משלהם, ומה שנשאר יעמוד לבד.</p>`
    + q.map(r => {
      const nDropped = dropsOf(r.id).size, live = liveEx(r), byShop = [];
      live.forEach(e => { let g = byShop.find(x => x.s === e.s); if (!g) byShop.push(g = { s: e.s, items: [] }); g.items.push(e); });
      const mins = byShop.map(g => Math.min(...g.items.map(x => x.p)));
      const ratio = !nDropped ? r.r : (mins.length > 1 ? (Math.max(...mins) / Math.min(...mins)).toFixed(2) : null);
      const shops = byShop.map(g => {
        const okey = r.id + '|' + g.s, open = RQ_OPEN.has(okey) || g.items.length <= 3;
        const show = open ? g.items : [g.items[0], g.items[g.items.length - 1]];
        const lo = g.items[0].p, hi = g.items[g.items.length - 1].p;
        return `<div class="rq-shop"><div style="flex:1;min-width:0">
            <div class="st-t">${esc(STORES[g.s] ? STORES[g.s].n : g.s)}</div>
            <div class="st-s">${g.items.length} ${g.items.length === 1 ? 'מוצר' : 'מוצרים'} · ${esc(lo === hi ? nis(lo) : nis(lo) + ' – ' + nis(hi))}</div>
          </div><button type="button" class="btn ghost small" style="color:var(--rose)" data-dropshop="${esc(r.id)}" data-s="${esc(g.s)}">לא שייך</button></div>`
          + show.map(e => `<div class="rq-li"><button type="button" class="rq-x" title="המוצר הזה לא שייך לשורה" data-drop="${esc(r.id)}" data-k="${esc(e.k)}">✕</button><span><b>${esc(nis(e.p))}</b> · ${e.u ? `<a href="${esc(e.u)}" target="_blank" rel="noopener">${esc(e.t)}</a>` : esc(e.t)}</span></div>`).join('')
          + (open ? '' : `<button type="button" class="rq-more" data-more="${esc(okey)}">להציג את כל ${g.items.length} המוצרים</button>`);
      }).join('');
      return `<div class="rq">
      <div class="rq-head">${r.img ? `<img class="rq-pic" src="${esc(r.img)}" alt="" loading="lazy">` : ''}
        <div style="flex:1;min-width:0">
          <div class="st-t">${esc(r.n)}</div>
          <div class="st-s">${esc(itemById[r.i] ? itemById[r.i].n : 'פריט ' + r.i)}${r.b ? ' · ' + esc(brandName(r.b) || r.b) : ''} · ${ratio ? 'הפרש מחירים פי ' + esc(ratio) : 'נשארה חנות אחת'}</div>
        </div></div>
      <div class="rq-ex">${live.length ? shops : '<div>הוצאת את כל המוצרים מהשורה הזו — היא תיעלם בעדכון הלילי, והמוצרים יופיעו כשורות נפרדות.</div>'}</div>
      ${nDropped ? `<div class="st-s" style="margin-top:7px">הוצאת ${nDropped} ${nDropped === 1 ? 'מוצר' : 'מוצרים'} מהשורה. ${nDropped === 1 ? 'הוא יהפוך' : 'הם יהפכו'} לשורה נפרדת בעדכון הלילי.</div>` : ''}
      <div class="row-btns" style="margin-top:9px">
        <button type="button" class="btn primary small" data-rqyes="${esc(r.id)}"${live.length ? '' : ' disabled'}>זה אותו מוצר</button>
        <button type="button" class="btn soft small" data-rqno="${esc(r.id)}">אלה מוצרים שונים</button>
      </div></div>`;
    }).join('');
}
function statusDrops(){
  const ov = OVERRIDES.drop || {}, known = {};
  ((ADMIN_DOC && ADMIN_DOC.drops) || []).forEach(d => { known[d.id + '\u0000' + d.k] = d; });
  const q = (ADMIN_DOC && ADMIN_DOC.review) || [];
  let n = 0, rows = '';
  for (const id of Object.keys(ov)) for (const k of (ov[id] || [])) {
    n++;
    const d = known[id + '\u0000' + k], row = q.find(x => x.id === id);
    const e = row && (row.ex || []).find(x => x.k === k);
    const t = (d && d.t) || (e && e.t) || k, sid = (d && d.s) || (e && e.s) || k.split('|')[0];
    const mn = (d && d.mn) || (row && row.n) || '';
    rows += `<div class="st-row"><span class="st-dot">✕</span><div class="st-main">
      <div class="st-t">${esc(t)}</div>
      <div class="st-s">${esc(STORES[sid] ? STORES[sid].n : sid)}${mn ? ' · הוצא מהשורה "' + esc(mn) + '"' : ''}</div></div>
      <button type="button" class="btn soft small" data-undrop="${esc(id)}" data-k="${esc(k)}">להחזיר</button></div>`;
  }
  return n ? `<div class="ttl" style="margin-top:18px">מוצרים שהוצאתי משורות (${n})</div>${rows}` : '';
}
// The plain data change behind a drop, with no opinion about which screen asked --
// the review queue re-renders its own modal (ruleDrop/undoDrop below), a product
// card just closes (adminSplit/adminUnsplit, further down) -- and both must save
// the exact same OVERRIDES.drop shape build_bundle.apply_drops() reads at night.
function addDrop(id, keys){
  const d = (OVERRIDES.drop = OVERRIDES.drop || {}), cur = new Set(d[id] || []);
  keys.forEach(k => cur.add(k));
  d[id] = Array.from(cur);
}
function removeDrop(id, k){
  const d = OVERRIDES.drop || {};
  d[id] = (d[id] || []).filter(x => x !== k);
  if (!d[id].length) delete d[id];
  if (!Object.keys(d).length) delete OVERRIDES.drop;
}
async function ruleDrop(id, keys){
  if (!keys || !keys.length) return;
  addDrop(id, keys);
  renderStatus();
  toast((await saveOverrides())
    ? `הוצאתי ${keys.length === 1 ? 'מוצר אחד' : keys.length + ' מוצרים'} מהשורה — ${keys.length === 1 ? 'הוא יעמוד' : 'הם יעמדו'} בנפרד מהעדכון הלילי`
    : 'התשובה מוצגת אצלך, אבל השמירה נכשלה — לנסות שוב');
}
async function undoDrop(id, k){
  removeDrop(id, k);
  renderStatus();
  toast((await saveOverrides()) ? 'חזר לשורה' : 'השמירה נכשלה — לנסות שוב');
}
// Same OVERRIDES.drop, called from a product's own card instead of the queue.
// There is no catalogue number to point at here, only a store -- so the key saved
// is the bare store id, which build_bundle._drop_hit already knows how to read.
async function adminSplit(m, sid){
  addDrop(m.id, [sid]);
  closeSheet();
  toast((await saveOverrides())
    ? `"${STORES[sid] ? STORES[sid].n : sid}" יוצג כמוצר נפרד — מעדכון הלילי`
    : 'התשובה מוצגת אצלך, אבל השמירה נכשלה — לנסות שוב');
}
async function adminUnsplit(m, sid){
  removeDrop(m.id, sid);
  closeSheet();
  toast((await saveOverrides()) ? 'חזר לשורה אחת' : 'השמירה נכשלה — לנסות שוב');
}
function statusPairs(){
  const p = openPairs();
  if (!ADMIN_DOC) return '';
  if (!p.length) return '<p style="font-size:13px;margin:4px 0 0">אין הצעות חדשות. ✓</p>';
  return `<p style="font-size:13px;margin:4px 0 8px">שני מוצרים שנראים כמו אותו דבר בשתי חנויות, שהמנוע לא חיבר לבד כי השמות שונים מדי. אם זה אותו מוצר — הם יתאחדו לשורה אחת עם השוואת מחיר, במקום להופיע פעמיים.</p>`
    + p.map(r => `<div class="rq">
      <div class="st-s" style="margin-bottom:6px">${esc(itemById[r.i] ? itemById[r.i].n : 'פריט ' + r.i)} · ${Math.round(r.score * 100)}% דומה</div>
      ${[r.a, r.b].map(x => `<div class="rq-head" style="margin-bottom:6px">
        ${x.img ? `<img class="rq-pic" src="${esc(x.img)}" alt="" loading="lazy">` : ''}
        <div style="flex:1;min-width:0">
          <div class="st-t">${x.u ? `<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}</a>` : esc(x.n)}</div>
          <div class="st-s">${esc(STORES[x.s] ? STORES[x.s].n : x.s)} · ${esc(nis(x.p))}</div>
        </div></div>`).join('')}
      <div class="row-btns">
        <button type="button" class="btn primary small" data-pyes="${esc(r.k)}">כן, לאחד</button>
        <button type="button" class="btn soft small" data-pno="${esc(r.k)}">לא, מוצרים שונים</button>
      </div></div>`).join('');
}
function statusMerged(){
  const gs = OVERRIDES.merge || [];
  if (!gs.length) return '';
  return `<div class="ttl" style="margin-top:18px">מוצרים שאיחדת (${gs.length})</div>` + gs.map((g, idx) => {
    const m = modelById[g[0]];
    return `<div class="st-row"><span class="st-dot">🔗</span><div class="st-main">
      <div class="st-t">${esc(m ? m.n : g[0])}</div>
      <div class="st-s">${g.length} שורות אוחדו לשורה אחת</div></div>
      <button type="button" class="btn soft small" data-unmerge="${idx}">לבטל</button></div>`;
  }).join('');
}
async function rulePair(key, join){
  const row = ((ADMIN_DOC && ADMIN_DOC.pairs) || []).find(r => r.k === key);
  if (!row) return;
  if (join) (OVERRIDES.merge = OVERRIDES.merge || []).push([row.a.id, row.b.id]);
  else (OVERRIDES.notmerge = OVERRIDES.notmerge || []).push(key);
  renderStatus();          // openPairs() hides it from here on -- and shows it again if he undoes the merge
  toast((await saveOverrides())
    ? (join ? `יתאחדו לשורה אחת בעדכון הלילי ✓` : 'סומן כמוצרים שונים — לא יחזור לכאן')
    : 'התשובה מוצגת אצלך, אבל השמירה נכשלה — לנסות שוב');
}
async function unmergePair(idx){
  const gs = OVERRIDES.merge || [];
  if (!gs[idx]) return;
  gs.splice(idx, 1);
  if (!gs.length) delete OVERRIDES.merge;
  renderStatus();
  toast((await saveOverrides()) ? 'האיחוד בוטל — השורות ייפרדו שוב בעדכון הלילי' : 'השמירה נכשלה — לנסות שוב');
}
function statusGone(){
  const g = (ADMIN_DOC && ADMIN_DOC.gone) || [];
  if (!g.length) return '<p style="font-size:13px;margin:4px 0 0">שום מוצר לא נעלם מאז הפרסום הקודם. ✓</p>';
  return `<p style="font-size:13px;margin:4px 0 8px">${g.length} מוצרים ירדו מהחנויות מאז הפרסום הקודם. הם כבר לא מוצגים לאף אחת — אבל אם מישהי כבר שמרה אחד מהם ברשימה שלה, כדאי שתדע.</p>`
    + g.map(x => `<div class="st-row"><span class="st-dot">·</span><div class="st-main">
      <div class="st-t">${esc(x.n)}</div>
      <div class="st-s">${esc(itemById[x.i] ? itemById[x.i].n : 'פריט ' + x.i)}${x.b ? ' · ' + esc(brandName(x.b) || x.b) : ''}${x.lo != null ? ' · היה ' + esc(nis(x.lo)) : ''}</div>
    </div></div>`).join('');
}
// Every answer he has given, with a way back. An answered row simply leaves the queue,
// so without this a mis-tap would be invisible as well as permanent.
function statusRuled(){
  const done = OVERRIDES.review || {}, ids = Object.keys(done);
  if (!ids.length) return '';
  const q = (ADMIN_DOC && ADMIN_DOC.review) || [];
  return `<div class="ttl" style="margin-top:18px">הכרעות שקיבלת (${ids.length})</div>` + ids.map(id => {
    const row = q.find(x => x.id === id), m = modelById[id], same = done[id] === 'same';
    return `<div class="st-row"><span class="st-dot">${same ? '✓' : '✕'}</span><div class="st-main">
      <div class="st-t">${esc((row && row.n) || (m && m.n) || id)}</div>
      <div class="st-s">${same ? 'אישרת — מוצג לכולן' : 'סימנת כמוצרים שונים — לא מוצג'}</div></div>
      <button type="button" class="btn soft small" data-unrule="${esc(id)}">לבטל</button></div>`;
  }).join('');
}
async function undoRule(id){
  const done = OVERRIDES.review || {};
  delete done[id];
  if (!Object.keys(done).length) delete OVERRIDES.review;
  renderStatus();
  toast((await saveOverrides()) ? 'ההכרעה בוטלה — השורה חזרה להמתנה' : 'השמירה נכשלה — לנסות שוב');
}
function renderStatus(){
  const q = openReview();
  const p = openPairs();
  const built = ADMIN_DOC && ADMIN_DOC.built;
  openModal(`<h2>מצב הכלי</h2>
    <div class="ttl" style="margin-top:12px">הריצות האחרונות</div>${statusRuns()}
    <div class="ttl" style="margin-top:18px">החנויות</div>${statusStores()}
    <div class="ttl" style="margin-top:18px">ממתין להכרעה שלך${q.length ? ` (${q.length})` : ''}</div>${statusQueue()}
    <div class="ttl" style="margin-top:18px">נראים כמו אותו מוצר${p.length ? ` (${p.length})` : ''}</div>${statusPairs()}
    ${statusRuled()}
    ${statusMerged()}
    ${statusDrops()}
    <div class="ttl" style="margin-top:18px">מוצרים שנעלמו מהחנויות</div>${statusGone()}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button type="button" class="btn soft" id="stClose">סגירה</button></div>
    <div class="admin-hint">${built ? `הנתונים כאן מהפרסום של ${esc(whenHe(built))}. ` : ''}הכרעה נשמרת מיד ונכנסת לקובץ של כולן בעדכון הלילי.</div>`);
  $('#stClose').onclick = closeModal;
  $$('[data-rqyes]', $('#modal')).forEach(b => b.onclick = () => ruleReview(b.dataset.rqyes, 'same'));
  $$('[data-rqno]',  $('#modal')).forEach(b => b.onclick = () => ruleReview(b.dataset.rqno,  'different'));
  $$('[data-pyes]',  $('#modal')).forEach(b => b.onclick = () => rulePair(b.dataset.pyes, true));
  $$('[data-pno]',   $('#modal')).forEach(b => b.onclick = () => rulePair(b.dataset.pno,  false));
  $$('[data-unrule]',  $('#modal')).forEach(b => b.onclick = () => undoRule(b.dataset.unrule));
  $$('[data-unmerge]', $('#modal')).forEach(b => b.onclick = () => unmergePair(+b.dataset.unmerge));
  $$('[data-drop]',     $('#modal')).forEach(b => b.onclick = () => ruleDrop(b.dataset.drop, [b.dataset.k]));
  $$('[data-dropshop]', $('#modal')).forEach(b => b.onclick = () => ruleDrop(b.dataset.dropshop, shopKeys(b.dataset.dropshop, b.dataset.s)));
  $$('[data-undrop]',   $('#modal')).forEach(b => b.onclick = () => undoDrop(b.dataset.undrop, b.dataset.k));
  $$('[data-more]',     $('#modal')).forEach(b => b.onclick = () => { RQ_OPEN.add(b.dataset.more); renderStatus(); });
}
async function ruleReview(id, verdict){
  const row = ((ADMIN_DOC && ADMIN_DOC.review) || []).find(r => r.id === id);
  const name = row ? row.n : 'המוצר';
  (OVERRIDES.review = OVERRIDES.review || {})[id] = verdict;
  renderStatus();          // openReview() hides it from here on, and the row stays so the undo list can name it
  toast((await saveOverrides())
    ? (verdict === 'same' ? `"${name}" ייצא לאוויר בעדכון הלילי ✓` : `"${name}" לא יוצג — ולא יחזור לכאן`)
    : 'התשובה מוצגת אצלך, אבל השמירה נכשלה — לנסות שוב');
}

function adminBox(m){
  if (!IS_ADMIN) return '';
  const ov = ovOf(m.id), dropped = dropsOf(m.id);
  const storeRows = m.offers.map(o => `<div class="adm-store"><span style="font-size:13px;font-weight:600">${esc(STORES[o.sid].n)}</span><button type="button" class="btn ghost small" data-admurl="${esc(o.sid)}">עריכת קישור</button>${m.offers.length > 1 ? (dropped.has(o.sid)
      ? `<button type="button" class="btn soft small" data-admunsplit="${esc(o.sid)}">לבטל — זה כן אותו מוצר</button>`
      : `<button type="button" class="btn ghost small" data-admsplit="${esc(o.sid)}" style="color:var(--rose)" title="המוצר בחנות הזו הוא לא אותו מוצר — יוצג כשורה נפרדת">לא שייך — מוצר אחר</button>`) +
      `<button type="button" class="btn ghost small" data-admhs="${esc(o.sid)}" style="color:var(--rose)">להסתיר חנות זו</button>` : ''}</div>`).join('');
  const restoreRows = (ov.hs || []).map(sid => `<div class="adm-store"><span style="font-size:13px">${esc(STORES[sid] ? STORES[sid].n : sid)} — הוסתרה</span><button type="button" class="btn soft small" data-admrs="${esc(sid)}">להחזיר</button></div>`).join('');
  return `<div class="admin-box"><div class="ttl">עריכת מנהל — משפיע על כל הנשים</div>
    <div class="row-btns">
      <button type="button" class="btn ${m.adminHidden ? 'primary' : 'soft'} small" data-adm="hide">${m.adminHidden ? 'להחזיר את המוצר' : 'להסיר את המוצר'}</button>
      <button type="button" class="btn soft small" data-adm="rename">שינוי שם</button>
      <button type="button" class="btn soft small" data-adm="move">העברת קטגוריה</button>
      <button type="button" class="btn soft small" data-adm="img">החלפת תמונה</button>
      <button type="button" class="btn soft small" data-adm="compare">הוספת חנות להשוואה</button>
    </div><div class="admin-hint">לאיחוד שני מוצרים או להעברה של כמה מוצרים יחד — "סימון מרובה" בראש גלריית המוצרים של הפריט.</div>${m.offers.length > 1 ? `<div class="admin-hint">חנות שמוכרת כאן בפועל מוצר אחר — "לא שייך" מפריד אותה לשורה משלה. זה שונה מ"הסתרה", שמוחקת אותה מהתצוגה לגמרי.</div>` : ''}${storeRows}${restoreRows}
    <div class="admin-hint">השינוי נשמר לכולן תוך כדקה, ונכנס לקובץ לצמיתות בעדכון הלילי.</div></div>`;
}
function adminRename(m){
  const orig = ((RAW_MODELS || []).find(x => x.id === m.id) || {}).n || '';
  openModal(`<h2>שינוי שם המוצר</h2><p style="font-size:14px">השם המקורי מהחנות: <b>${esc(orig)}</b></p>
    <div class="field"><label for="admName">שם חדש</label><input id="admName" type="text" value="${esc(m.n)}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${ovOf(m.id).name ? `<button type="button" class="btn ghost small" id="admNameReset" style="margin-inline-end:auto">חזרה לשם המקורי</button>` : ''}<button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">שמירה</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admNameReset')?.addEventListener('click', () => { closeModal(); closeSheet(); adminApply(m.id, {name:null}, 'חזר לשם המקורי ✓'); });
  $('#admSave').onclick = () => { const v = $('#admName').value.trim(); if (!v) return; closeModal(); closeSheet(); adminApply(m.id, {name: v === orig ? null : v}, 'השם עודכן לכולן ✓'); };
}
function adminMove(m){
  const orig = ((RAW_MODELS || []).find(x => x.id === m.id) || {}).i;
  openModal(`<h2>העברת קטגוריה</h2><p style="font-size:14px">לאיזה פריט שייך "${esc(m.n)}"?</p>
    <div class="field"><label for="admItem">פריט ברשימה</label><select id="admItem">${ITEMS.map(it => `<option value="${it.id}" ${it.id === m.i ? 'selected' : ''}>${esc(it.c)} — ${esc(it.n)}</option>`).join('')}</select></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">העברה</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admSave').onclick = () => { const v = +$('#admItem').value; closeModal(); closeSheet(); adminApply(m.id, {item: v === orig ? null : v}, 'המוצר הועבר ✓'); };
}
/* ---------- מבנה הרשימה: קטגוריות, תתי-קטגוריות, שמות ותגיות (קרן) ----------
   הכל נשמר ב-OVERRIDES.items, באותו מבנה שה-build קורא בלילה. אף פעולה כאן לא
   מוחקת כלום ולא נוגעת במזהים — ולכן רשימה שמורה של אמא לא יכולה להיפגע.        */
function ovItems(){ return (OVERRIDES.items = OVERRIDES.items || {}); }
// המסך נבנה מחדש אחרי כל פעולה — בלי זה הוא היה קופץ בכל פעם לראש הרשימה
let STRUCT_SCROLL = 0;
const structKeep = () => { STRUCT_SCROLL = $('#modal')?.scrollTop || 0; };
async function saveStructure(msg){
  prepareData(); fixCustomCats(); renderAll();
  toast((await saveOverrides()) ? msg : 'השינוי מוצג אצלך, אבל השמירה נכשלה — לנסות שוב' + saveErrNote());
  adminStructure();
}
/* ---------- קבוצות וואטסאפ (דניאל) ----------
   שורה לכל חודש שהאישה יכולה לבחור בשאלת התאריך, ועוד כל חודש שכבר יש לו קישור.
   נשמר ב-OVERRIDES.wa יחד עם שאר תיקוני המנהל — ולכן קבוצה חדשה נכנסת לכלי
   תוך כדקה, בלי לגעת בעורך התמה ובלי פרסום.                                       */
function adminWaGroups(){
  const cur = waGroups();
  const keys = [];
  for (let i = 0; i < 12; i++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1); keys.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')); }
  Object.keys(cur).forEach(k => { if (/^\d{4}-\d{2}$/.test(k) && !keys.includes(k)) keys.push(k); });
  keys.sort();
  openModal(`<h2>קבוצות וואטסאפ</h2>
    <p style="font-size:13.5px;margin-bottom:10px">לכל חודש משוער קבוצה משלו. אישה שבחרה תאריך בחודש שיש לו קישור כאן, מקבלת מיד אחרי שאלת התאריך הצעה להצטרף — וגם כפתור קבוע בהגדרות. חודש בלי קישור מדולג בשקט, והיא לא רואה כלום.</p>
    <div id="waRows">${keys.map(k => `<div class="field"><label for="wa-${k}">${esc(waMonthName(k))}</label><input id="wa-${k}" data-wa="${k}" type="url" dir="ltr" placeholder="https://chat.whatsapp.com/…" value="${esc(cur[k] || '')}"></div>`).join('')}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="waCancel">סגירה</button><button type="button" class="btn primary" id="waSave">שמירה</button></div>
    <div class="admin-hint">את הקישור מוציאים מהוואטסאפ עצמו: פרטי הקבוצה ← הזמנה באמצעות קישור ← העתקת קישור. כדי להוריד קבוצה — מוחקים את השורה ושומרים.</div>`);
  $('#waCancel').onclick = closeModal;
  $('#waSave').onclick = async () => {
    const next = {}; const bad = [];
    $$('#waRows [data-wa]').forEach(inp => {
      const v = String(inp.value || '').trim();
      if (!v) return;
      if (!/^https:\/\//i.test(v)) { bad.push(waMonthName(inp.dataset.wa)); return; }
      next[inp.dataset.wa] = v;
    });
    if (bad.length) return toast('קישור לא תקין ב' + bad.join(', ') + ' — קישור מתחיל ב-https://');
    OVERRIDES.wa = next;
    closeModal();
    toast((await saveOverrides()) ? `נשמרו ${Object.keys(next).length} קבוצות ✓` : 'השינוי מוצג אצלך, אבל השמירה נכשלה — לנסות שוב' + saveErrNote());
  };
}
function adminStructure(){
  const ov = ovItems();
  const newCats = (ov.cats || {}).add || [];
  const emptyNew = newCats.map(cleanName).filter(c => c && !CATS.includes(c));
  const byCat = {}; ITEMS.forEach(i => (byCat[i.c] = byCat[i.c] || []).push(i));
  const catRow = (c, empty) => `<div class="st-row"><div class="st-main">
      <div class="st-t">${catIcon(catKey(c))} ${esc(c)}${CAT_ORIG[c] ? ` <span class="st-s">(היה: ${esc(CAT_ORIG[c])})</span>` : ''}</div>
      <div class="st-s">${empty ? 'חדשה — עוד אין בה תת-קטגוריות' : `${(byCat[c] || []).length} תת-קטגוריות`}</div></div>
      <div class="row-btns"><button type="button" class="btn ghost small" data-cren="${esc(c)}">שינוי שם</button><button type="button" class="btn soft small" data-cadd="${esc(c)}">תת-קטגוריה חדשה</button></div></div>`;
  const itemRow = it => `<div class="st-row"><div class="st-main">
      <div class="st-t">${esc(it.n)}</div>
      <div class="st-s"><span class="tag ${TAGS[it.t] || 'opt'}">${esc(it.t || 'מומלץ')}</span> · ${it.nm || 0} מוצרים${it.id >= NEW_ITEM_FLOOR ? ' · נוספה על ידך' : ''}</div></div>
      <div class="row-btns"><button type="button" class="btn ghost small" data-iren="${it.id}">שינוי שם</button><button type="button" class="btn ghost small" data-itag="${it.id}">תגית</button></div></div>`;
  // עריכה שהעדכון הלילי דחה — אחרת היא הייתה נעלמת בשקט והמסך היה משקר
  const WHY = {dup_id:'המזהה כבר תפוס', bad_id:'מזהה לא תקין', bad_name:'שם לא תקין (אולי יש בו הערה פנימית)',
               unknown_cat:'הקטגוריה לא קיימת', unknown_item:'תת-הקטגוריה כבר לא קיימת', bad_tag:'תגית לא מוכרת',
               name_taken:'כבר קיימת קטגוריה בשם הזה'};
  const probs = Object.entries((DATA && DATA.itemedits) || {}).filter(([, v]) => v && v.s !== 'ok');
  openModal(`<h2>מבנה הרשימה</h2>
    <p style="font-size:13.5px;margin-bottom:10px">כאן משנים את השלד של הרשימה — הקטגוריות, תתי-הקטגוריות, השמות והתגיות. השינוי נכנס מיד לכל הנשים. מזהים לא משתנים, ולכן רשימות ששמורות אצל נשים לא נפגעות.</p>
    ${probs.length ? `<div class="notice" style="margin-bottom:12px"><b>${probs.length} עריכות לא נכנסו לעדכון הלילי:</b><br>${probs.map(([k, v]) => `${esc(k)} — ${esc(WHY[v.s] || v.s)}`).join('<br>')}</div>` : ''}
    <div class="ttl">קטגוריות (${CATS.length + emptyNew.length})</div>
    ${CATS.map(c => catRow(c, false)).join('')}${emptyNew.map(c => catRow(c, true)).join('')}
    <div class="row-btns" style="margin:8px 0 16px"><button type="button" class="btn soft small" id="stAddCat">הוספת קטגוריה</button></div>
    <div class="ttl">תתי-קטגוריות (${ITEMS.length})</div>
    ${CATS.map(c => `<div class="st-s" style="margin:10px 0 4px;font-weight:700">${esc(c)}</div>${(byCat[c] || []).map(itemRow).join('')}`).join('')}
    <div style="display:flex;justify-content:flex-end;margin-top:14px"><button type="button" class="btn soft" id="stClose">סגירה</button></div>`);
  $('#stClose').onclick = () => { STRUCT_SCROLL = 0; closeModal(); };
  $('#stAddCat').onclick = () => { structKeep(); structAddCat(); };
  $$('[data-cren]', $('#modal')).forEach(b => b.onclick = () => { structKeep(); structRenameCat(b.dataset.cren); });
  $$('[data-cadd]', $('#modal')).forEach(b => b.onclick = () => { structKeep(); structAddItem(b.dataset.cadd); });
  $$('[data-iren]', $('#modal')).forEach(b => b.onclick = () => { structKeep(); structRenameItem(+b.dataset.iren); });
  $$('[data-itag]', $('#modal')).forEach(b => b.onclick = () => { structKeep(); structTag(+b.dataset.itag); });
  if (STRUCT_SCROLL) { const el = $('#modal'); el.scrollTop = STRUCT_SCROLL; requestAnimationFrame(() => { el.scrollTop = STRUCT_SCROLL; }); }
}
function structAddCat(){
  openModal(`<h2>קטגוריה חדשה</h2><p style="font-size:14px">הקטגוריה תופיע לנשים רק אחרי שתהיה בה תת-קטגוריה עם מוצרים — כך שאף אחת לא תראה מדור ריק.</p>
    <div class="field"><label for="stName">שם הקטגוריה</label><input id="stName" type="text" maxlength="40" placeholder="לדוגמה: נסיעות"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="stCancel">ביטול</button><button type="button" class="btn primary" id="stSave">הוספה</button></div>`);
  $('#stCancel').onclick = adminStructure;
  $('#stSave').onclick = () => {
    const v = cleanName($('#stName').value);
    if (!nameOk(v)) return toast('שם לא תקין');
    if (CATS.includes(v) || ((ovItems().cats || {}).add || []).includes(v)) return toast('כבר קיימת קטגוריה בשם הזה');
    const ov = ovItems(); ov.cats = ov.cats || {}; ov.cats.add = [...(ov.cats.add || []), v];
    closeModal(); saveStructure(`הקטגוריה "${v}" נוספה`);
  };
}
function structRenameCat(cat){
  openModal(`<h2>שינוי שם קטגוריה</h2><p style="font-size:14px">"${esc(cat)}" — השם מתחלף לכל הנשים. חודשי הקנייה והאייקון של הקטגוריה נשמרים.</p>
    <div class="field"><label for="stName">שם חדש</label><input id="stName" type="text" maxlength="40" value="${esc(cat)}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="stCancel">ביטול</button><button type="button" class="btn primary" id="stSave">שמירה</button></div>`);
  $('#stCancel').onclick = adminStructure;
  $('#stSave').onclick = () => {
    const v = cleanName($('#stName').value);
    if (!nameOk(v)) return toast('שם לא תקין');
    if (v === cat) return adminStructure();
    const pending = ((ovItems().cats || {}).add || []).map(cleanName).filter(c => c !== cat);
    if (CATS.includes(v) || pending.includes(v)) return toast('כבר קיימת קטגוריה בשם הזה — איחוד קטגוריות לא נתמך');
    const ov = ovItems(); ov.cats = ov.cats || {}; const ren = ov.cats.ren = ov.cats.ren || {};
    // שומרים מפה שטוחה: אם הקטגוריה כבר שונתה פעם, מעדכנים את אותה רשומה
    const orig = CAT_ORIG[cat] || cat;
    if (orig === v) delete ren[orig]; else ren[orig] = v;
    const addList = (ov.cats.add || []).map(cleanName);
    if (addList.includes(cat)) { ov.cats.add = addList.map(c => c === cat ? v : c); delete ren[orig]; }
    if (!Object.keys(ren).length) delete ov.cats.ren;
    closeModal(); saveStructure(`השם שונה ל"${v}"`);
  };
}
function structAddItem(cat){
  openModal(`<h2>תת-קטגוריה חדשה</h2><p style="font-size:14px">בתוך "${esc(cat)}". היא תיווצר ריקה — מוצרים נכנסים אליה בסימון מרובה בגלריה ("העברה לתת-קטגוריה אחרת").</p>
    <div class="field"><label for="stName">שם</label><input id="stName" type="text" maxlength="40" placeholder="לדוגמה: כיסוי גשם"></div>
    <div class="field two"><div><label for="stTag">תגית</label><select id="stTag">${ITEM_TAGS.map(t => `<option value="${t}"${t === 'מומלץ' ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
      <div><label for="stQty">כמות מומלצת</label><input id="stQty" type="number" min="1" max="9" value="1"></div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="stCancel">ביטול</button><button type="button" class="btn primary" id="stSave">הוספה</button></div>`);
  $('#stCancel').onclick = adminStructure;
  $('#stSave').onclick = () => {
    const v = cleanName($('#stName').value);
    if (!nameOk(v)) return toast('שם לא תקין');
    const ov = ovItems();
    const maxId = Math.max(NEW_ITEM_FLOOR, ...ITEMS.map(i => i.id), ...((ov.add || []).map(e => +e.id || 0)));
    ov.add = [...(ov.add || []), { id: maxId + 1, c: cat, n: v, t: $('#stTag').value, q: Math.max(1, Math.min(9, +$('#stQty').value || 1)) }];
    closeModal(); saveStructure(`"${v}" נוספה ל${cat}`);
  };
}
function structRenameItem(id){
  const it = itemById[id]; if (!it) return;
  openModal(`<h2>שינוי שם</h2><p style="font-size:14px">"${esc(it.n)}" — השם מתחלף לכל הנשים. המוצרים שבתוכה והרשימות ששמורות עליה לא מושפעים.</p>
    <div class="field"><label for="stName">שם חדש</label><input id="stName" type="text" maxlength="40" value="${esc(it.n)}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="stCancel">ביטול</button><button type="button" class="btn primary" id="stSave">שמירה</button></div>`);
  $('#stCancel').onclick = adminStructure;
  $('#stSave').onclick = () => {
    const v = cleanName($('#stName').value);
    if (!nameOk(v)) return toast('שם לא תקין');
    const ov = ovItems();
    const added = (ov.add || []).find(e => +e.id === id);
    if (added) added.n = v;                       // תת-קטגוריה שקרן הוסיפה — עורכים במקום
    else { ov.ren = ov.ren || {}; ov.ren[id] = v; }
    closeModal(); saveStructure(`השם שונה ל"${v}"`);
  };
}
function structTag(id){
  const it = itemById[id]; if (!it) return;
  openModal(`<h2>תגית</h2><p style="font-size:14px">"${esc(it.n)}" — התגית קובעת גם את הסינון ("חובה") וגם את מד ההתקדמות בראש הרשימה.</p>
    <div class="field"><label for="stTag">תגית</label><select id="stTag">${ITEM_TAGS.map(t => `<option value="${t}"${t === it.t ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="stCancel">ביטול</button><button type="button" class="btn primary" id="stSave">שמירה</button></div>`);
  $('#stCancel').onclick = adminStructure;
  $('#stSave').onclick = () => {
    const v = $('#stTag').value;
    const ov = ovItems();
    const added = (ov.add || []).find(e => +e.id === id);
    if (added) added.t = v;
    else { ov.tag = ov.tag || {}; ov.tag[id] = v; }
    closeModal(); saveStructure(`"${it.n}" סומנה כ${v}`);
  };
}

/* ---------- הוספת חנות להשוואה (מנהל) ----------
   מוצר שנמצא אצלנו בחנות אחת בלבד, ובפועל נמכר בעוד אחת מהחנויות שאנחנו סורקים:
   מדביקים את הקישור מהחנות השנייה, והשורות מתאחדות לשורה אחת עם השוואת מחיר.
   מתחת למכסה המנוע זה בדיוק אותו `overrides.merge` — ולכן גם ניתן לביטול במסך "מצב הכלי". */
function urlKey(u){
  try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + x.pathname.replace(/\.html$/, '').replace(/\/+$/, ''); }
  catch (e) { return ''; }
}
function findModelByUrl(u){
  const k = urlKey(u); if (!k) return null;
  for (const m of Object.values(modelById)) for (const o of (m.offers || [])) if (urlKey(o.u) === k) return { m, sid: o.sid };
  return null;
}
function adminCompare(m){
  openModal(`<h2>הוספת חנות להשוואה</h2>
    <p style="font-size:14px">"${esc(m.n)}" מוצג כרגע ב-${m.offers.length === 1 ? 'חנות אחת' : `${m.offers.length} חנויות`}. אם אותו מוצר בדיוק נמכר בעוד אחת מהחנויות שלנו — מדביקים כאן את הקישור לדף המוצר שם, והשורות יתאחדו לשורה אחת עם השוואת מחיר.</p>
    <div class="field"><label for="admCmpUrl">קישור לדף המוצר בחנות השנייה</label><input id="admCmpUrl" type="url" dir="ltr" placeholder="https://"></div>
    <div class="admin-hint" id="admCmpStore"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admFind">חיפוש</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admCmpUrl').addEventListener('input', () => {
    const sid = manualStoreOf($('#admCmpUrl').value.trim());
    $('#admCmpStore').innerHTML = !$('#admCmpUrl').value.trim() ? ''
      : sid ? `זוהתה חנות: <b>${esc(STORES[sid].n)}</b> · ${manualFresh(sid)}`
            : '<span style="color:var(--rose)">הקישור אינו מאחת משש החנויות שהכלי מכיר</span>';
  });
  $('#admFind').onclick = () => {
    const u = $('#admCmpUrl').value.trim();
    const hit = findModelByUrl(u);
    // המוצר עוד לא בסריקה (או שהמנוע סינן אותו) — מזהים חנות, מבקשים מחיר, וזהו
    if (!hit) return adminCompareNew(m, u);
    if (hit.m.id === m.id) return toast('זה כבר אותו מוצר');
    const joined = new Set((OVERRIDES.merge || []).flat());
    if (joined.has(hit.m.id) || joined.has(m.id)) return toast('אחד המוצרים כבר אוחד — אפשר לבטל את האיחוד הקודם במסך "מצב הכלי"');
    const cross = hit.m.i !== m.i;
    openModal(`<h2>לאחד?</h2>
      <p style="font-size:14px">מצאתי בחנות <b>${esc(STORES[hit.sid].n)}</b>:</p>
      <div class="store"><div class="l1"><span class="sc">${esc(hit.m.n)}</span><span class="p num">${nis(hit.m.min)}</span></div>
        <div class="meta"><span>${esc(itemById[hit.m.i] ? itemById[hit.m.i].n : 'פריט ' + hit.m.i)}${hit.m.brand ? ' · ' + esc(hit.m.brand) : ''}</span></div></div>
      <p style="font-size:14px">אחרי האיחוד תישאר שורה אחת — <b>"${esc(m.n)}"</b> — עם המחירים משתי החנויות.${cross ? ' המוצר השני יועבר גם לאותה תת-קטגוריה.' : ''}</p>
      <p class="why">נכנס לקובץ בעדכון הלילי. ניתן לביטול במסך "מצב הכלי", תחת "מוצרים שאיחדת".</p>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel2">ביטול</button><button type="button" class="btn primary" id="admJoin">לאחד</button></div>`);
    $('#admCancel2').onclick = closeModal;
    $('#admJoin').onclick = async () => {
      if (cross) setOverride(hit.m.id, { item: m.i });     // איחוד חוצה-פריטים נדחה במנוע — מיישרים קודם
      (OVERRIDES.merge = OVERRIDES.merge || []).push([m.id, hit.m.id]);
      closeModal();
      prepareData(); renderList(); openModel(m.id);        // רואים את השורה המאוחדת מיד
      toast((await saveOverrides()) ? 'אוחדו — החנות נוספה להשוואה' : 'השמירה נכשלה — לנסות שוב' + saveErrNote());
    };
  };
}
/* המוצר לא נמצא בסריקה: מזהים את החנות מהקישור, המנהל נותן מחיר ראשוני,
   והמוצר נכנס כהצעה נוספת לאותה שורה. הרשומה נשארת ב-overrides, ולכן כל סריקה
   לילית מנסה למצוא אותו מחדש — וברגע שתמצא, המחיר החי מחליף את מה שהוזן ביד. */
function adminCompareNew(m, url){
  const sid = manualStoreOf(url);
  if (!sid) return toast('הקישור אינו מאחת משש החנויות שהכלי מכיר');
  openModal(`<h2>הוספת ${esc(STORES[sid].n)} להשוואה</h2>
    <p style="font-size:14px">המוצר הזה עוד לא נמצא בסריקה שלנו. אפשר להוסיף אותו עכשיו עם מחיר שתזין/י — הוא ייכנס מיד כחנות נוספת ל"${esc(m.n)}", וימשיך להיבדק בכל סריקה: ברגע שהסריקה תמצא אותו, המחיר החי יחליף את מה שהזנת.</p>
    <div class="field"><label for="admNewPrice">המחיר בחנות (₪)</label><input id="admNewPrice" type="number" min="0" step="0.1" inputmode="decimal"></div>
    <div class="field"><label for="admNewName">שם המוצר בחנות (לא חובה)</label><input id="admNewName" type="text" maxlength="40" placeholder="${esc(m.n)}"></div>
    <div class="admin-hint">${esc(STORES[sid].n)} · ${manualFresh(sid)}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="admCancel3">ביטול</button><button type="button" class="btn primary" id="admNewSave">הוספה</button></div>`);
  $('#admCancel3').onclick = closeModal;
  $('#admNewSave').onclick = async () => {
    const price = parseFloat($('#admNewPrice').value);
    if (!(price > 0)) { $('#admNewPrice').focus(); return toast('צריך מחיר'); }
    if (m.offers.some(o => o.sid === sid)) return toast(`${STORES[sid].n} כבר מופיעה במוצר הזה`);
    const k = 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const e = { item: m.i, url, price, attach: m.id, added: new Date().toISOString().slice(0, 10) };
    const nm = $('#admNewName').value.trim(); if (nm) e.name = nm;
    (OVERRIDES.manual = OVERRIDES.manual || {})[k] = e;
    closeModal();
    prepareData(); renderList(); openModel(m.id);          // ההצעה החדשה כבר בכרטיס
    toast((await saveOverrides()) ? `${STORES[sid].n} נוספה להשוואה` : 'השמירה נכשלה — לנסות שוב' + saveErrNote());
  };
}

function adminEditUrl(m, sid){
  const raw = (RAW_MODELS || []).find(x => x.id === m.id) || {}, origU = (((raw.o || {})[sid]) || {}).u || '';
  const cur = ((ovOf(m.id).url || {})[sid]) || origU;
  openModal(`<h2>עריכת קישור — ${esc(STORES[sid].n)}</h2>
    <div class="field"><label for="admUrl">כתובת דף המוצר</label><input id="admUrl" type="url" dir="ltr" value="${esc(cur)}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${(ovOf(m.id).url || {})[sid] ? `<button type="button" class="btn ghost small" id="admUrlReset" style="margin-inline-end:auto">חזרה לקישור המקורי</button>` : ''}<button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">שמירה</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admUrlReset')?.addEventListener('click', () => { const url = {...(ovOf(m.id).url || {})}; delete url[sid]; closeModal(); closeSheet(); adminApply(m.id, {url}, 'הקישור חזר למקורי ✓'); });
  $('#admSave').onclick = () => { const v = $('#admUrl').value.trim(); if (!/^https?:\/\//.test(v)) { toast('כתובת לא תקינה'); return; } const url = {...(ovOf(m.id).url || {})}; if (v === origU) delete url[sid]; else url[sid] = v; closeModal(); closeSheet(); adminApply(m.id, {url}, 'הקישור עודכן ✓'); };
}
function adminImage(m){
  const orig = ((RAW_MODELS || []).find(x => x.id === m.id) || {}).img || '';
  const cur = ovOf(m.id).img || orig;
  const okImg = isShopifyImg;
  openModal(`<h2>החלפת תמונה</h2>
    <p style="font-size:14px">נכנסים לדף המוצר בחנות, קליק ימני על התמונה הרצויה ← "העתקת כתובת התמונה" ← מדביקים כאן. אפשר רק תמונות מחנויות שופיפיי — גם כתובת שמתחילה ב-cdn.shopify.com וגם כתובת מהדומיין של החנות עצמה (עם /cdn/shop/ בתוכה).</p>
    <div class="field"><label for="admImg">כתובת התמונה</label><input id="admImg" type="url" dir="ltr" value="${esc(cur)}" placeholder="https://cdn.shopify.com/... או https://www.shilav.co.il/cdn/shop/..."></div>
    <div style="text-align:center;min-height:96px"><img id="admImgPrev" src="${esc(cur)}" alt="" style="max-height:96px;max-width:150px;border-radius:8px;${cur ? '' : 'display:none'}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${ovOf(m.id).img ? `<button type="button" class="btn ghost small" id="admImgReset" style="margin-inline-end:auto">חזרה לתמונה המקורית</button>` : ''}<button type="button" class="btn soft" id="admCancel">ביטול</button><button type="button" class="btn primary" id="admSave">שמירה</button></div>`);
  $('#admCancel').onclick = closeModal;
  $('#admImg').addEventListener('input', () => { const v = $('#admImg').value.trim(), p = $('#admImgPrev'); if (okImg(v)) { p.src = v; p.style.display = ''; } else p.style.display = 'none'; });
  $('#admImgReset')?.addEventListener('click', () => { closeModal(); closeSheet(); adminApply(m.id, {img: null}, 'התמונה חזרה למקורית ✓'); });
  $('#admSave').onclick = () => {
    let v = $('#admImg').value.trim();
    if (!okImg(v)) { toast('אפשר רק תמונה מחנות שופיפיי — מ-cdn.shopify.com או מדף המוצר בחנות (קישור עם /cdn/shop/)'); return; }
    v = v.split('?')[0] + '?width=200';
    closeModal(); closeSheet(); adminApply(m.id, {img: v === orig ? null : v}, 'התמונה עודכנה לכולן ✓');
  };
}

/* ---------- הוספת מוצר לכולן (מנהל) — מנגנון אחד זהה לכל שש החנויות ---------- */
// מזהים את החנות רק מהדומיין של הקישור (לקח ה-agalease — לא מנחשים מכינוי).
const NIGHTLY_STORES = {shilav:1, babystar:1, motsesim:1, agalease:1};
function manualStoreOf(u){
  try {
    const h = new URL(u).hostname.replace(/^www\./, '');
    for (const [sid, s] of Object.entries(STORES)) if (new URL(s.u).hostname.replace(/^www\./, '') === h) return sid;
  } catch(e) {}
  return null;
}
// רק בכלי הניהול (החלטת דניאל 15.9): ללקוחות אין הערות קצב-עדכון.
function manualFresh(sid){ return NIGHTLY_STORES[sid] ? 'המחיר יתעדכן מדי לילה' : 'המחיר יתעדכן רק בסריקה הידנית שלך (בערך פעם בשבוע)'; }
function manualStatusLine(k){
  const st = (DATA.manual || {})[k];
  if (st && st.s === 'ok' && st.byHand) return {t:'✓ פעיל עם המחיר שהזנת — יתעדכן כשהסריקה תמצא אותו', open: null};
  if (!st) return {t:'⏳ ממתין לעדכון הלילי — ייכנס לקובץ של כולן עד מחר בבוקר', open:null};
  if (st.s === 'ok') return {t:'✓ פעיל בקובץ לכולן', open: modelById[st.id] ? st.id : null};
  if (st.s === 'duplicate') return {t:'כבר קיים בהתאמות האוטומטיות — אין צורך בהוספה', open: modelById[st.id] ? st.id : null};
  if (st.s === 'not_found') return {t:'⚠️ לא נמצא בסריקה של החנות — לבדוק שזה קישור לדף מוצר', open:null};
  if (st.s === 'bad_url') return {t:'⚠️ הקישור אינו מאחת משש החנויות', open:null};
  if (st.s === 'bad_item') return {t:'⚠️ הפריט שנבחר כבר לא קיים ברשימה', open:null};
  if (st.s === 'no_feed') return {t:'⚠️ אין נתוני סריקה לחנות הזו כרגע', open:null};
  return {t:'⚠️ ' + esc(st.s), open:null};
}
function adminManualProducts(){
  const man = OVERRIDES.manual || {};
  const rows = Object.keys(man).sort((a, b) => ((man[a].added || '') + a).localeCompare((man[b].added || '') + b)).map(k => {
    const e = man[k], sid = manualStoreOf(e.url), it = itemById[e.item], st = manualStatusLine(k);
    return `<div class="adm-store" style="flex-wrap:wrap"><div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600">${sid ? esc(STORES[sid].n) : 'חנות לא מזוהה'} · ${it ? esc(it.n) : 'פריט ' + esc(String(e.item))}${e.note ? ` · <span style="font-weight:400">${esc(e.note)}</span>` : ''}</div>
      <div style="font-size:12px;color:var(--muted);direction:ltr;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.url)}</div>
      <div style="font-size:12px">${st.t}${sid ? ' · ' + manualFresh(sid) : ''}</div></div>
      ${st.open ? `<button type="button" class="btn ghost small" data-mopen="${esc(st.open)}">לצפייה</button>` : ''}
      <button type="button" class="btn ghost small" data-mdel="${esc(k)}" style="color:var(--rose)">הסרה</button></div>`;
  }).join('');
  openModal(`<h2>מוצרים שהוספת לכולן</h2>
    <p style="font-size:14px">מדביקים קישור לדף מוצר מאחת משש החנויות ובוחרים לאיזה פריט הוא שייך. המוצר מצטרף אצל כולן לצד ההתאמות האוטומטיות — לא במקומן — ומקבל עדכוני מחיר אוטומטיים בכל סריקה של החנות שלו, כמו כל מוצר אחר.</p>
    <div class="field"><label for="amUrl">קישור לדף המוצר</label><input id="amUrl" type="url" dir="ltr" placeholder="https://..."></div>
    <div id="amStore" style="font-size:13px;min-height:18px;margin:-6px 0 8px"></div>
    <div class="field"><label for="amItem">לאיזה פריט ברשימה?</label><select id="amItem">${ITEMS.map(it => `<option value="${it.id}">${esc(it.c)} — ${esc(it.n)}</option>`).join('')}</select></div>
    <div class="field"><label for="amNote">הערה (רואה רק את/ה)</label><input id="amNote" type="text" maxlength="120"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="amClose">סגירה</button><button type="button" class="btn primary" id="amAdd">הוספה לכולן</button></div>
    ${rows ? `<div class="ttl" style="margin-top:16px">מה שכבר נוסף</div>${rows}` : ''}
    <div class="admin-hint">מוצר חדש נכנס לקובץ של כולן בעדכון הלילי. שילב, בייביסטאר, מוצצים ועגליס נסרקות כל לילה; מיננה וסופר-פארם מתעדכנות רק כשאת/ה סורק/ת אותן מהדפדפן.</div>`);
  const urlBox = $('#amUrl'), storeLine = $('#amStore');
  urlBox.addEventListener('input', () => {
    const sid = manualStoreOf(urlBox.value.trim());
    storeLine.innerHTML = !urlBox.value.trim() ? '' : sid
      ? `זוהתה חנות: <b>${esc(STORES[sid].n)}</b> · ${manualFresh(sid)}`
      : '<span style="color:var(--rose)">הקישור אינו מאחת משש החנויות שהכלי מכיר</span>';
  });
  $('#amClose').onclick = closeModal;
  $('#amAdd').onclick = async () => {
    const url = urlBox.value.trim();
    if (!manualStoreOf(url)) { toast('צריך קישור לדף מוצר מאחת משש החנויות'); urlBox.focus(); return; }
    const k = 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const e = {item: +$('#amItem').value, url, added: new Date().toISOString().slice(0, 10)};
    const note = $('#amNote').value.trim(); if (note) e.note = note;
    (OVERRIDES.manual = OVERRIDES.manual || {})[k] = e;
    closeModal();
    toast((await saveOverrides()) ? 'נשמר — ייכנס לכולן בעדכון הלילי ✓' : 'השמירה נכשלה — לנסות שוב' + saveErrNote());
    adminManualProducts();
  };
  $$('[data-mdel]', $('#modal')).forEach(b => b.onclick = async () => {
    delete OVERRIDES.manual[b.dataset.mdel];
    closeModal();
    toast((await saveOverrides()) ? 'הוסר — ייעלם מהקובץ בעדכון הלילי' : 'השמירה נכשלה — לנסות שוב');
    adminManualProducts();
  });
  $$('[data-mopen]', $('#modal')).forEach(b => b.onclick = () => { closeModal(); openModel(b.dataset.mopen); });
}

/* ---------- מחיר אישי — הנחת מועדון/קופון, נשמר רק ברשימה של המשתמש/ת ---------- */
function openPriceEdit(key, itemId){
  const f = findByKey(key), t = f.custom || f.pick; if (!t) return;
  const isPick = !!f.pick; let storeP = null;
  if (isPick) { const m = modelById[t.m], o = m && m.offers.find(x => x.sid === t.s); storeP = o ? o.p : null; }
  const cur = isPick ? (t.pp != null ? t.pp : storeP) : (+t.price || 0);
  openModal(`<h2>המחיר שלי</h2><p>יש לכם הנחת מועדון או קופון? רשמו את המחיר שתשלמו בפועל — הוא ייכנס לסיכום ולפריסה החודשית. נשמר רק ברשימה שלכם.${storeP != null ? ` המחיר בחנות: <b class="num">${nis(storeP)}</b>.` : ''}</p>
    <div class="field"><label for="ppVal">מחיר ליחידה (₪)</label><input id="ppVal" type="number" min="0" step="0.1" inputmode="decimal" value="${cur ?? ''}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${isPick && t.pp != null ? `<button type="button" class="btn ghost small" id="ppReset" style="margin-inline-end:auto;color:var(--rose)">חזרה למחיר החנות</button>` : ''}<button type="button" class="btn soft" id="ppCancel">ביטול</button><button type="button" class="btn primary" id="ppSave">שמירה</button></div>`);
  const done = msg => { save(); closeModal(); itemId != null ? rerenderItem(itemId) : renderList(); toast(msg); };
  $('#ppCancel').onclick = closeModal;
  const rst = $('#ppReset'); if (rst) rst.onclick = () => { delete t.pp; done('חזר למחיר החנות'); };
  $('#ppSave').onclick = () => {
    const v = parseFloat($('#ppVal').value); if (isNaN(v) || v < 0) { $('#ppVal').focus(); return; }
    if (isPick) { if (storeP != null && Math.abs(v - storeP) < 0.005) delete t.pp; else t.pp = v; } else t.price = v;
    done('המחיר עודכן ✓');
  };
}

/* ---------- מוצר משלי (הוספה ידנית) ---------- */
function openManual(itemId, cat){
  const it = itemId ? itemById[itemId] : null;
  openModal(`<h2>${it ? esc(it.n) : 'מוצר משלי'}</h2><p>${it ? 'מוצר מחנות שהכלי לא בודק, או שלא מופיע ברשימה.' : 'מוצר שלא ברשימה, מכל חנות — כדי שהכול יהיה במקום אחד.'}</p>
    ${it ? '' : `<div class="field"><label for="mfCat">קטגוריה</label><select id="mfCat">${CATS.map(c => `<option ${c===cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="field"><label for="mfItem">לאיזה פריט זה שייך?</label><select id="mfItem"></select></div><div class="field" id="mfNameWrap"><label for="mfName">שם המוצר</label><input id="mfName" required></div>`}
    <div class="field"><label for="mfStore">חנות או אתר</label><input id="mfStore" placeholder="למשל: עלי אקספרס, חנות בקניון…"></div>
    <div class="field two"><div class="field"><label for="mfPrice">מחיר (₪)</label><input id="mfPrice" type="number" min="0" step="0.1" inputmode="decimal"></div><div class="field"><label for="mfQty">כמות</label><input id="mfQty" type="number" min="1" value="${it ? defaultQty(it) : 1}" inputmode="numeric"></div></div>
    <div class="field"><label for="mfUrl">קישור (לא חובה)</label><input id="mfUrl" type="url" dir="ltr" placeholder="https://"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="mfCancel">ביטול</button><button type="button" class="btn primary" id="mfSave">הוספה לרשימה</button></div>
    ${IS_ADMIN ? `<div class="admin-box"><div class="ttl">מנהל</div><div class="row-btns"><button type="button" class="btn soft small" id="mfAdminAll">הוספת מוצר לכולן — מקישור לחנות</button><button type="button" class="btn soft small" id="mfAdminRemoved">מוצרים שהסרתי</button><button type="button" class="btn soft small" id="mfAdminStruct">מבנה הרשימה</button><button type="button" class="btn soft small" id="mfAdminWa">קבוצות וואטסאפ</button><button type="button" class="btn soft small" id="mfAdminStatus">מצב הכלי</button></div></div>` : ''}`);
  $('#mfAdminAll')?.addEventListener('click', () => { closeModal(); adminManualProducts(); });
  $('#mfAdminRemoved')?.addEventListener('click', () => { closeModal(); adminRemovedList(null); });
  $('#mfAdminStruct')?.addEventListener('click', () => { closeModal(); adminStructure(); });
  $('#mfAdminWa')?.addEventListener('click', () => { closeModal(); adminWaGroups(); });
  $('#mfAdminStatus')?.addEventListener('click', () => { closeModal(); adminStatus(); });
  if (!it) {
    const fillItems = () => { const c = $('#mfCat').value; $('#mfItem').innerHTML = `<option value="">פריט חדש — לא מהרשימה</option>` + ITEMS.filter(i => i.c === c).map(i => `<option value="${i.id}">${esc(i.n)}</option>`).join(''); $('#mfNameWrap').hidden = false; };
    fillItems();
    $('#mfCat').onchange = fillItems;
    $('#mfItem').onchange = () => { $('#mfNameWrap').hidden = !!$('#mfItem').value; };
  }
  $('#mfCancel').onclick = closeModal;
  $('#mfSave').onclick = () => {
    const price = parseFloat($('#mfPrice').value); if (isNaN(price)) { $('#mfPrice').focus(); return toast('צריך מחיר כדי שהמוצר ייכנס לסיכום'); }
    const q = Math.max(1, parseInt($('#mfQty').value) || 1), store = $('#mfStore').value.trim(), url = $('#mfUrl').value.trim();
    const linked = it || (($('#mfItem') && $('#mfItem').value) ? itemById[+$('#mfItem').value] : null);
    let name = linked ? linked.n : $('#mfName').value.trim(); if (!name) { $('#mfName').focus(); return toast('מה שם המוצר?'); }
    S.custom.push({ id: uid(), i: linked ? linked.id : null, c: linked ? linked.c : $('#mfCat').value, name, store, price, url, q, who:'me' });
    if (linked) delete S.have[linked.id];
    save(); closeModal(); (linked && !$('#mfCat')) ? rerenderItem(linked.id) : (S.open = linked ? linked.c : ($('#mfCat') ? $('#mfCat').value : S.open), renderList()); toast('נוסף לרשימה ✓');
  };
}

/* ---------- סיכום ---------- */
function renderBudget(){
  const ls_ = lines(), buy = toBuy(ls_), sum = totalBuy(ls_);
  const gifts = ls_.filter(l => l.who === 'gift'), given = ls_.filter(l => l.who === 'given');
  const claimedUnits = gifts.reduce((a, l) => a + Math.min(l.qty || 1, claimedOf(l.key)), 0);
  const claimedSum = gifts.reduce((a, l) => a + l.price * Math.min(l.qty || 1, claimedOf(l.key)), 0);
  const giftOpen = gifts.filter(l => buyQty(l) > 0);
  const byCat = {}; buy.forEach(l => byCat[l.cat] = (byCat[l.cat]||0) + l.price*buyQty(l));
  const byStore = {}; buy.forEach(l => byStore[l.store] = (byStore[l.store]||0) + l.price*buyQty(l));
  const saved = buy.reduce((a, l) => a + (l.model && l.model.nStores > 1 ? (l.model.maxP - l.price) * buyQty(l) : 0), 0);
  const open = ITEMS.filter(i => !handled(i)), openMust = open.filter(i => i.t === 'חובה');
  const shown = UI.bstore ? ls_.filter(l => l.store === UI.bstore) : ls_;
  if (UI.bstore && !byStore[UI.bstore] && !shown.length) UI.bstore = null;   // החנות כבר לא ברשימה
  const off = [];
  if (given.length) off.push(`${given.length} שמגיעים במתנה`);
  if (claimedUnits) off.push(`${claimedUnits} ${claimedUnits === 1 ? 'יחידה שכבר נתפסה' : 'יחידות שכבר נתפסו'} במתנה (${nis(claimedSum)})`);
  $('#view-budget').innerHTML = `<div class="card"><h3>כמה זה יוצא</h3><div class="bigline"><b class="num">${nis(sum)}</b><span class="muted">${buy.length} מוצרים לקנייה</span></div>
      ${saved > 0 ? `<div style="font-size:14.5px;color:var(--sage);font-weight:700;margin-top:6px">חיסכון של ${nis(saved)} לעומת קנייה בחנות היקרה ביותר</div>` : ''}
      ${giftOpen.length ? `<div class="why" style="margin-top:6px">כולל ${giftOpen.length} שביקשתם במתנה — נספרים עד שמישהו יתפוס אותם.</div>` : ''}
      ${off.length ? `<div class="why" style="margin-top:6px">לא נספרים כאן: ${off.join(' · ')}</div>` : ''}
      <p class="why">${open.length ? `עוד ${open.length} פריטים לא טופלו${openMust.length ? ` (${openMust.length} מהם חובה)` : ''} — הסכום יגדל.` : 'כל הפריטים טופלו'} מחירים לפי הבדיקה האחרונה; המחיר הסופי הוא באתר החנות.</p></div>
    <div class="card"><h3>לפי קטגוריה</h3><div class="kv">${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c, v]) => `<span>${catIcon(catKey(c))} ${esc(c)}</span><span class="num" style="font-weight:700">${nis(v)}</span>`).join('') || '<span class="muted">עדיין לא נבחרו מוצרים</span>'}</div></div>
    <div class="card"><h3>לפי חנות</h3><p class="why" style="margin:0 0 8px">לחיצה על חנות מסננת את הרשימה המלאה למטה.</p><div class="kv kv-click">${Object.entries(byStore).sort((a,b)=>b[1]-a[1]).map(([s, v]) => `<button type="button" data-bstore="${esc(s)}" class="${UI.bstore === s ? 'on' : ''}">${esc(s)}</button><span class="num" style="font-weight:700">${nis(v)}</span>`).join('') || '<span class="muted">—</span>'}</div></div>
    <div class="card"><h3>הרשימה המלאה${UI.bstore ? ` — ${esc(UI.bstore)}` : ''}</h3>${UI.bstore ? `<p class="why" style="margin:0 0 8px">${shown.length} מוצרים מ${esc(UI.bstore)} · ${nis(totalBuy(shown))} <button type="button" class="linklike" id="bStoreAll" style="margin-inline-start:8px">להצגת כל החנויות</button></p>` : ''}<div class="tblwrap"><table><thead><tr><th>מוצר</th><th>חנות</th><th class="n">כמות</th><th class="n">סה״כ</th></tr></thead><tbody>${shown.map(l => { const g = giftLabel(l), q = buyQty(l) || (l.qty || 1);
      return `<tr><td><span class="nm">${esc(l.name)}</span><br><small class="muted">${l.item ? esc(l.item.n) : esc(l.cat)}${l.brand ? ' · ' + esc(l.brand) : ''}${g && g.note ? ' · ' + g.note : ''}</small>${g ? `<div class="tagline"><span class="tag ${g.cls}">${g.t}</span></div>` : ''}</td><td>${esc(l.store)}</td><td class="n num">${q}${buyQty(l) && buyQty(l) !== (l.qty || 1) ? ` <small class="muted">מתוך ${l.qty}</small>` : ''}</td><td class="n num">${nis(l.price*buyQty(l))}</td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">אין מוצרים להצגה</td></tr>'}</tbody></table></div></div>`;
  bindBudget();
}

function bindBudget(){
  $$('#view-budget [data-bstore]').forEach(b => b.onclick = () => { UI.bstore = (UI.bstore === b.dataset.bstore) ? null : b.dataset.bstore; renderBudget(); });
  $('#bStoreAll')?.addEventListener('click', () => { UI.bstore = null; renderBudget(); });
}

/* ---------- לפי חודשים — הטבלה BUY_MONTHS_BEFORE, ואז איזון ההוצאה ----------
   הכללים (הכרעת דניאל, 20.9):
   1. פריט "נעול" — מוצר גדול שצריך להירכש מוקדם (`e` בנתונים) או פריט עם חריג מפורש בטבלה — לא זז בכלל.
   2. כל השאר יכול לזוז **רק מוקדם יותר** מחודש ההמלצה, אף פעם לא מאוחר, ולכל היותר MONTH_MAX_EARLY חודשים.
   3. פריט בלי מחיר (עוד לא נבחר לו מוצר) לא זז ולא משפיע.
   4. הזזה נעשית רק אם היא באמת מקטינה את החודש העמוס — אף פעם לא "מעבירה את הבעיה" לחודש אחר.  */
function monthsBefore(it, cat){ return it && BUY_MONTHS_BEFORE_ITEM[it.id] != null ? BUY_MONTHS_BEFORE_ITEM[it.id] : (BUY_MONTHS_BEFORE[cat] ?? 1); }
function monthLocked(it){ return !!it && (!!it.e || BUY_MONTHS_BEFORE_ITEM[it.id] != null); }
// איזון: מחזיר מפה key→אינדקס חודש. נבדק ב-16 מבחני יחידה לפני ההשתלה.
function balanceMonths(entries, n, maxEarly, cap = 500){
  const idx = new Map(), sums = new Array(n).fill(0), moves = new Map();
  const home = e => Math.max(0, Math.min(n - 1, e.target));
  for (const e of entries) { const at = home(e); idx.set(e.key, at); sums[at] += e.cost; }
  if (n < 2) return { idx, sums, moves };
  const movable = entries.filter(e => !e.locked && e.cost > 0);
  let guard = 0;
  for (let i = n - 1; i >= 1; i--) {
    for (;;) {
      if (++guard > cap) return { idx, sums, moves };
      const here = movable.filter(e => idx.get(e.key) === i).sort((a, b) => b.cost - a.cost);
      if (!here.length) break;
      let best = null;
      for (const e of here) {
        const floor = Math.max(0, home(e) - maxEarly);
        let j = -1;
        for (let k = i - 1; k >= floor; k--) if (j < 0 || sums[k] < sums[j] - 1e-9) j = k;   // שוויון → הקרוב ביותר, כלומר ההזזה המינימלית
        if (j < 0) continue;
        const gain = Math.max(sums[i], sums[j]) - Math.max(sums[i] - e.cost, sums[j] + e.cost);
        if (gain > 1e-9 && (!best || gain > best.gain + 1e-9)) best = { e, j, gain };
      }
      if (!best) break;
      sums[i] -= best.e.cost; sums[best.j] += best.e.cost;
      idx.set(best.e.key, best.j); moves.set(best.e.key, home(best.e) - best.j);
    }
  }
  return { idx, sums, moves };
}
function monthPlan(){
  if (!S.profile?.due) return null;
  const due = new Date(S.profile.due + 'T00:00:00'), months = []; let d = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  while (d <= due && months.length < CONFIG.MAX_MONTHS) { months.push({ y: d.getFullYear(), m: d.getMonth(), items: [], sum: 0 }); d = new Date(d.getFullYear(), d.getMonth()+1, 1); }
  if (!months.length) months.push({ y: TODAY.getFullYear(), m: TODAY.getMonth(), items: [], sum: 0 });
  const n = months.length;
  const byItem = {}; lines().forEach(l => { const k = l.itemId || l.key; (byItem[k] ||= []).push(l); });
  const entries = [];
  const add = (key, it, cat, ls_, name) => { const nb = monthsBefore(it, cat);
    entries.push({ key, it, name, ls: ls_, nb, cost: totalBuy(ls_), locked: monthLocked(it), target: n - 1 - nb }); };
  ITEMS.filter(i => !S.have[i.id]).forEach(it => add('i' + it.id, it, catKey(it.c), byItem[it.id] || [], it.n));
  S.custom.filter(c => !c.i).forEach(c => add('c' + c.id, null, catKey(c.c), byItem['c' + c.id] || [], c.name));
  const { idx, moves } = balanceMonths(entries, n, CONFIG.MONTH_MAX_EARLY);
  entries.forEach(e => { const mo = months[idx.get(e.key)];
    mo.items.push({ name: e.name, it: e.it, ls: e.ls, nb: e.nb, moved: moves.get(e.key) || 0 }); mo.sum += e.cost; });
  months.forEach(mo => mo.items.sort((a, b) => (b.ls.length ? 1 : 0) - (a.ls.length ? 1 : 0)));
  return months;
}
function renderMonths(){
  const plan = monthPlan();
  if (!plan) { $('#view-months').innerHTML = `<div class="card"><p>כדי לפרוס את הקניות צריך תאריך לידה משוער. <button type="button" class="btn small" id="setDue">הגדרת תאריך</button></p></div>`; $('#setDue').onclick = editProfile; return; }
  const sum = plan.reduce((a, m) => a + m.sum, 0), nItems = plan.reduce((a, m) => a + m.items.length, 0);
  const nMoved = plan.reduce((a, m) => a + m.items.filter(x => x.moved > 0).length, 0);
  $('#view-months').innerHTML = `<div class="card"><div class="bigline"><b class="num">${nis(sum)}</b><span class="muted">${nItems} פריטים על פני ${plan.length} חודשים</span></div><p class="why">לפי ההמלצה של me &amp; mommy מתי לקנות כל קטגוריה, ${nMoved ? 'ומחולק כך שההוצאה תתפזר בין החודשים ולא תיפול על חודש אחד' : 'ובתוספת איזון של ההוצאה בין החודשים'}. המוצרים הגדולים נשארים במועד שלהם. פריט בלי מחיר = עוד לא נבחר לו מוצר. <button type="button" class="btn small ghost" id="editDue" style="padding:2px 8px;color:var(--peach-ink)">תאריך: ${esc(dueText())} ✎</button></p></div>
    <div class="tl">${plan.map(m => `<div class="month"><div class="card"><header><h3>${MONTHS_HE[m.m]} ${m.y}</h3><b class="num">${nis(m.sum)}</b></header>${m.items.length ? `<ul>${m.items.map(({name, it, ls: ls_, nb, moved}) => { return `<li class="${ls_.length?'':'open'}"><span><span class="n">${esc(name)}</span><small>${ls_.length ? ls_.map(l => { const g = giftLabel(l); return esc(l.name) + (g ? ` <span class="tag ${g.cls}">${g.t}</span>` : ''); }).join(' + ') : 'עוד לא נבחר מוצר'}${nb ? ` · מומלץ כ-${nb} חודשים לפני` : ' · סמוך ללידה'}${moved ? ` · הוקדם ב-${moved} ${moved === 1 ? 'חודש' : 'חודשים'} לאיזון ההוצאה` : ''}</small></span><span class="num" style="font-weight:700">${ls_.length ? nis(totalBuy(ls_)) : (it ? '<button type="button" class="btn small soft" data-pick="' + it.id + '">לבחור</button>' : '')}</span></li>`; }).join('')}</ul>` : `<div class="why" style="margin:0">חודש חופשי — אין קניות</div>`}</div></div>`).join('')}</div>`;
  $('#editDue').onclick = editProfile;
  $$('#view-months [data-pick]').forEach(b => b.onclick = () => { const id = +b.dataset.pick, ms = modelsByItem[id] || []; if (!ms.length) return openManual(id); ms.length === 1 ? openModel(ms[0].id) : openModels(id); });
}

/* ---------- מתנות ---------- */
// הודעת הוואטסאפ: משפט אחד + הקישור. רשימת הטקסט הישנה בוטלה (החלטת דניאל, 20.9).
const GIFT_WA_TEXT = link => `הכנו רשימת מתנות ללידה. אפשר לבחור מתנה ולסמן שאתם מביאים אותה, בלי הרשמה:\n${link}`;
// מטמון קל של תפיסות המתנה (כמה יחידות כל שורה נתפסה) — מתעדכן ב-showView('gifts')
let GIFT_CLAIMS_CACHE = {};
async function refreshGiftClaims(){
  if (!USER) return false;
  try {
    const r = await fetch(APP_PROXY_BASE + 'gift-claims', {credentials:'same-origin', cache:'no-store'});
    const d = await r.json();
    if (!d || !d.ok) return false;
    const next = d.claims || {}, changed = JSON.stringify(next) !== JSON.stringify(GIFT_CLAIMS_CACHE);
    GIFT_CLAIMS_CACHE = next;
    return changed;
  } catch(e) { return false; }
}
// מי תפס את המתנה — השם מגיע מהתפיסה עצמה (הנותן/ת רשמו אותו; זה לא שדה חובה)
function giverNames(c){
  return [...new Set(((c && c.entries) || []).map(e => String(e.giverName || '').trim()).filter(Boolean))];
}
// תג הסטטוס — משמש את הרשימה הרגילה (הכרעת דניאל #3) וגם את לשונית המתנות
function giftBadge(key, qty, asRow){
  const c = GIFT_CLAIMS_CACHE[key]; if (!c || !c.claimed) return '';
  const covered = c.claimed >= qty, who = giverNames(c);
  const txt = covered
    ? (who.length ? `נתפס על ידי ${esc(who.join(', '))}` : 'נתפס — מישהו כבר מביא את זה')
    : `${c.claimed} מתוך ${qty} נתפסו${who.length ? ` · ${esc(who.join(', '))}` : ' במתנה'}`;
  const tag = `<span class="tag ${covered ? 'best' : 'gift'}">${txt}</span>`;
  return asRow ? `<div class="row">${tag}</div>` : ' ' + tag;
}
// תווית הסטטוס בסיכום ובחודשים: מה מבוקש כמתנה, ומה כבר מגיע במתנה (ולכן עלותו אפס)
function giftLabel(l){
  if (l.who === 'given') return { t: 'מתקבל במתנה', cls: 'best' };
  if (l.who !== 'gift') return null;
  const q = l.qty || 1, c = Math.min(q, claimedOf(l.key));
  // התווית קצרה תמיד ובאותו אורך — הפירוט יושב בשורת הפרטים, לא בתוך התווית
  return c >= q ? { t: 'מתקבל במתנה', cls: 'best' }
                : { t: 'מבוקש כמתנה', cls: 'gift', note: c > 0 ? `${c} מתוך ${q} כבר נתפסו` : '' };
}
function renderGifts(){
  const ls_ = lines(), gs = ls_.filter(l => l.who === 'gift'), given = ls_.filter(l => l.who === 'given');
  const row = g => `<div class="gift">${thumb(g.img)}<span class="t">${esc(g.name)}${giftBadge(g.key, g.qty, false)}</span><span class="p num">${nis(g.price * g.qty)}</span><span class="m">${esc(g.store)}${g.qty > 1 ? ` · ×${g.qty}` : ''}${g.item ? ` · ${esc(g.item.n)}` : ''}</span></div>`;
  $('#view-gifts').innerHTML = `<div class="card"><div class="bigline"><b class="num">${gs.length}</b><span class="muted">מתנות לבקש · שווי ${nis(total(gs))}</span></div>
      <div style="margin-top:14px"><a class="btn primary big" id="btnShareGifts" href="#" target="_blank" rel="noopener" ${gs.length?'':'aria-disabled="true"'}>שיתוף רשימת המתנות</a>
        <div style="text-align:center;margin-top:10px"><button type="button" class="linklike" id="btnGiftLink" ${gs.length?'':'disabled'}>אפשרויות הקישור</button></div></div>
      <p class="why">${gs.length ? 'הכפתור פותח וואטסאפ עם קישור אישי לרשימה. מי שמקבל אותו בוחר מתנה ומסמן שהוא מביא אותה — בלי חשבון — וזה מסומן לכם ברשימה ויורד מהתקציב. ב"אפשרויות הקישור" אפשר להעתיק את הקישור או ליצור קישור חדש שמבטל את הישן.' : 'כדי לבקש מוצר במתנה: ברשימה, על מוצר שנבחר, לוחצים "לבקש במתנה".'}</p></div>
    ${gs.map(row).join('')}
    ${given.length ? `<div class="given-box"><div class="given-head"><h3>מגיע במתנה</h3><span>${given.length}</span></div><p class="why">מכאן ולמטה — מוצרים שמישהו כבר קונה. הם לא נספרים בסיכום.</p>${given.map(row).join('')}</div>` : ''}`;
  // הכפתור הוא קישור אמיתי לוואטסאפ: הטוקן נטען ברקע ונכנס ל-href, כך שההקשה עצמה לא נחסמת כחלון קופץ
  const share = $('#btnShareGifts');
  if (gs.length) ensureGiftLink().then(t => { if (t && $('#btnShareGifts') === share) share.href = 'https://wa.me/?text=' + encodeURIComponent(GIFT_WA_TEXT(giftShareLink(t))); });
  share.onclick = async e => {
    if (!gs.length) { e.preventDefault(); return; }
    if (share.getAttribute('href') !== '#') return;              // מוכן — הדפדפן פותח את וואטסאפ בעצמו
    e.preventDefault();
    const t = await ensureGiftLink();
    if (!t) { toast('לא הצלחנו לטעון קישור — לנסות שוב בעוד רגע'); return; }
    share.href = 'https://wa.me/?text=' + encodeURIComponent(GIFT_WA_TEXT(giftShareLink(t)));
    window.open(share.href, '_blank', 'noopener');
  };
  $('#btnGiftLink').onclick = () => openGiftLinkModal();
}
// ---- קישור לתפיסת מתנות: הטוקן נבנה בשרת (הווקר) — הדפדפן רק מציג/מעתיק ----
async function fetchGiftLink(rotate){
  try {
    const r = await fetch(APP_PROXY_BASE + 'gift-link', {method: rotate ? 'POST' : 'GET', credentials:'same-origin', cache:'no-store'});
    const d = await r.json();
    if (!d || !d.ok) return null;
    if (S.profile && d.salt) S.profile.giftSalt = d.salt; // מסונכרן — כך שהשמירה הבאה לא תדרוס את הסאלט החדש
    return d.token;
  } catch(e) { return null; }
}
let GIFT_LINK_TOKEN = null;
async function ensureGiftLink(){
  if (GIFT_LINK_TOKEN) return GIFT_LINK_TOKEN;
  GIFT_LINK_TOKEN = await fetchGiftLink(false);
  return GIFT_LINK_TOKEN;
}
// בניית כתובת השיתוף. בזמן בדיקה על עותק תמה — שהקישור יפתח את אותו עותק.
// שופיפיי מוחקת את preview_theme_id מהכתובת אחרי הטעינה, לכן קוראים מ-Shopify.theme ולא מהכתובת.
function giftShareLink(token){
  const url = new URL(location.pathname, CONFIG.STORE_HOME); url.searchParams.set('gift', token);
  const th = (typeof Shopify !== 'undefined' && Shopify.theme) ? Shopify.theme : null;
  const pt = new URL(location.href).searchParams.get('preview_theme_id') || (th && th.role && th.role !== 'main' && th.id ? String(th.id) : null);
  if (pt) url.searchParams.set('preview_theme_id', pt);
  return url.toString();
}
async function openGiftLinkModal(){
  openModal(`<h2>קישור לתפיסת מתנות</h2><p class="lead">כל מי שמקבל את הקישור יכול לתפוס מתנה — בלי חשבון. מי שתפס משהו, זה יסומן כ"מכוסה" ברשימה שלכם.</p><p class="why">טוענים קישור…</p>`);
  const token = await ensureGiftLink();
  if (!token) { openModal(`<h2>קישור לתפיסת מתנות</h2><p>לא הצלחנו לטעון קישור כרגע — לנסות שוב בעוד רגע.</p><button type="button" class="btn soft" id="giftLinkClose">סגירה</button>`); $('#giftLinkClose').onclick = closeModal; return; }
  renderGiftLinkModal(token);
}
function renderGiftLinkModal(token){
  const link = giftShareLink(token);
  openModal(`<h2>קישור לתפיסת מתנות</h2><p class="lead">כל מי שמקבל את הקישור יכול לתפוס מתנה — בלי חשבון. מי שתפס משהו, זה יסומן כ"מכוסה" ברשימה שלכם.</p><div class="linkbox"><textarea id="giftLinkTxt" readonly>${esc(link)}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(link)}" target="_blank" rel="noopener">שליחה בוואטסאפ</a><button type="button" class="btn" id="copyGiftLink">העתקה</button><button type="button" class="btn ghost" id="rotateGiftLink">קישור חדש (מבטל את הישן)</button><button type="button" class="btn soft" id="giftLinkClose">סגירה</button></div>`);
  $('#copyGiftLink').onclick = async () => { try { await navigator.clipboard.writeText(link); toast('הקישור הועתק'); } catch(e) { $('#giftLinkTxt').select(); toast('סמנו והעתיקו את הטקסט'); } };
  $('#rotateGiftLink').onclick = async () => { const t = await fetchGiftLink(true); if (t) { GIFT_LINK_TOKEN = t; renderGiftLinkModal(t); if (UI.view === 'gifts') renderGifts(); toast('קישור חדש נוצר — הקישור הקודם בוטל'); } else toast('לא הצלחנו — לנסות שוב'); };
  $('#giftLinkClose').onclick = closeModal;
}

/* ---------- עמוד מתנות לאורח/ת (בלי חשבון) ---------- */
function giftLocalKey(token){ return 'bl_gift_mine_' + token.split('.').slice(0,2).join('.'); }
function giftLocalGet(token){ return ls.get(giftLocalKey(token)) || {}; }
function giftLocalSet(token, map){ ls.set(giftLocalKey(token), map); }
async function bootGiftView(token){
  showScreen('screen-loading');
  let d;
  try {
    const r = await fetch(APP_PROXY_BASE + 'gift?t=' + encodeURIComponent(token), {credentials:'same-origin', cache:'no-store'});
    d = await r.json();
  } catch(e) { d = null; }
  if (!d || !d.ok) {
    $('#errMsg').textContent = (d && d.error === 'revoked_or_missing') ? 'הקישור הזה כבר לא בתוקף — כדאי לבקש קישור מעודכן.' : 'לא הצלחנו לטעון את רשימת המתנות. אולי הקישור פגום.';
    showScreen('screen-error');
    return;
  }
  renderGiftScreen(d.list, d.claims || {}, token);
}
function renderGiftScreen(list, claims, token){
  showScreen(null);
  $('#app').hidden = true; $('#tabs').hidden = true; $('#fabAdd').hidden = true;
  let el = $('#screen-gift');
  // המסך חייב לשבת בתוך שורש הכלי (ליד שאר המסכים) — בתמה ה-CSS וה-$ מתוחמים ל-#bl
  if (!el) { el = document.createElement('div'); el.id = 'screen-gift'; el.className = 'full'; $('#screen-loading').parentNode.insertBefore(el, $('#screen-loading')); }
  el.hidden = false;
  const gs = lines(normalize(list)).filter(l => l.who === 'gift');
  const mine = giftLocalGet(token);
  const row = g => {
    const c = claims[g.key] || {claimed:0, entries:[]};
    const remaining = Math.max(0, g.qty - c.claimed);
    const myEntryId = mine[g.key];
    const already = !!myEntryId && c.entries.some(e => e.id === myEntryId);
    // השוואת מחירים: כל החנויות שמוכרות את הדגם, מהזולה ליקרה (הבחירה של האמא מודגשת)
    const offers = g.model ? g.model.offers.filter(o => STORES[o.sid] && !STORES[o.sid].hidden).slice().sort((a, b) => a.p - b.p) : [];
    GUEST_ROWS[g.key] = g;
    const buyBtn = offers.length
      ? `<button type="button" class="btn soft small" data-stores="${esc(g.key)}">לרכישה בחנות${offers.length > 1 ? ` · ${offers.length} חנויות` : ''}</button>`
      : (g.url ? `<a class="btn soft small" href="${esc(g.url)}" target="_blank" rel="noopener">לרכישה בחנות</a>` : '');
    const action = already
      ? `<button type="button" class="btn small ghost" data-unclaim="${esc(g.key)}">ביטול — בסוף לא אקנה</button>`
      : remaining > 0
        ? `<button type="button" class="btn small primary" data-claim="${esc(g.key)}" data-remaining="${remaining}" data-asked="${g.qty || 1}" data-name="${esc(g.name)}">אני לוקח/ת את זה</button>`
        : `<span class="tag best">נתפס במלואו</span>`;
    // שורה אחת: התפיסה בימין, הרכישה בשמאל (מתחת למחיר)
    return `<div class="gift">${thumb(g.img)}<span class="t">${esc(g.name)}</span><span class="p num">${g.price ? nis(g.price) : ''}</span><span class="m">${esc(g.store)}${g.item ? ` · ${esc(g.item.n)}` : ''}${g.qty > 1 ? ` · נדרשות ${g.qty}${c.claimed ? `, ${c.claimed} כבר נתפסו` : ''}` : ''}</span><span class="act">${action}${buyBtn}</span></div>`;
  };
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span></div><div class="step">
      <h1>רשימת המתנות</h1>
      <p class="lead">הוזמנת לרשימת מתנות. בוחרים מתנה, מסמנים כמות, רושמים שם (לא חובה) - וזהו</p>
      ${gs.length ? gs.map(row).join('') : '<p class="why">עדיין לא סומנו מתנות ברשימה הזו.</p>'}
    </div>`;
  $$('#screen-gift [data-claim]').forEach(b => b.onclick = () => openGiftClaimModal(b.dataset.claim, +b.dataset.remaining, token, +b.dataset.asked || 1, b.dataset.name || ''));
  $$('#screen-gift [data-unclaim]').forEach(b => b.onclick = () => giftUnclaim(b.dataset.unclaim, token));
  $$('#screen-gift [data-stores]').forEach(b => b.onclick = () => openStoresModal(GUEST_ROWS[b.dataset.stores]));
}
/* חלון "לקניה בחנות" לנותן/ת המתנה — אותו מידע שהאמא רואה בכרטיס המוצר:
   התמונה, כל החנויות שמוכרות אותו מהזולה ליקרה, וקישור לכל אחת. בלי הוספה לרשימה ובלי כלי מנהל. */
const GUEST_ROWS = {};
function openStoresModal(g){
  if (!g) return;
  const m = g.model;
  const offers = m ? m.offers.filter(o => STORES[o.sid] && !STORES[o.sid].hidden).slice().sort((a, b) => a.p - b.p) : [];
  if (!offers.length) { if (g.url) window.open(g.url, '_blank', 'noopener'); return; }
  const min = offers[0].p, many = offers.length > 1, allSame = offers.every(o => o.p === min);
  openModal(`<h2 style="font-size:20px">${esc(g.name)}</h2>
    <p class="why" style="margin:0 0 12px">${m.brand ? esc(m.brand) + (g.item ? ' · ' : '') : ''}${g.item ? esc(g.item.n) : ''}</p>
    ${thumb(m.img, 'lg', true)}
    ${many ? (allSame ? `<p class="notice" style="margin:0 0 12px">אותו מחיר ב-${offers.length} החנויות.</p>` : `<p class="notice info" style="margin:0 0 12px">נמכר ב-${offers.length} חנויות — הזול ביותר מסומן.</p>`) : `<p class="notice" style="margin:0 0 12px">נמצא בחנות אחת.</p>`}
    ${offers.map(o => `<div class="store ${many && !allSame && o.p === min ? 'best' : ''}">
      <div class="l1"><span class="sc">${storeChip(o.sid)}${many && !allSame && o.p === min ? '<span class="tag best">הכי זול</span>' : ''}${o.sid === g.sid ? '<span class="tag early">הבחירה של האמא</span>' : ''}</span><span class="p num">${priceLabel(o)}</span></div>
      ${!o.a || (o.px && o.px > o.p) ? `<div class="meta">${!o.a ? '<span class="unavail">לא מסומן במלאי — לבדוק בחנות</span>' : ''}${o.px && o.px > o.p ? `<span>טווח: ${nis(o.p)}–${nis(o.px)} לפי גודל/גרסה</span>` : ''}</div>` : ''}
      <div class="acts"><a class="btn primary small" href="${esc(o.u)}" target="_blank" rel="noopener">לקניה ב${esc(STORES[o.sid].n)}</a></div></div>`).join('')}
    <div style="display:flex;justify-content:flex-end"><button type="button" class="btn soft" id="gsClose">סגירה</button></div>`);
  $('#gsClose').onclick = closeModal;
}
// הכמות היא בדיוק מה שנשאר: מה שהאמא ביקשה, פחות מה שכבר נתפס.
function openGiftClaimModal(lineKey, remaining, token, asked, name){
  const opts = [];
  for (let i = 1; i <= remaining; i++) opts.push(`<option value="${i}">${i}</option>`);
  openModal(`<h2>${esc(name || 'תפיסת מתנה')}</h2>
    <p>${asked > 1 ? `ביקשו ${asked} יחידות${remaining < asked ? ` · ${asked - remaining} כבר נתפסו` : ''}.` : ''} כמה תביאו?</p>
    <div class="field"><label for="giftQty">כמות</label>${remaining > 1
      ? `<select id="giftQty">${opts.join('')}</select>`
      : `<input id="giftQty" type="text" value="1" readonly>`}</div>
    <div class="field"><label for="giftName">שם (לא חובה — כדי שהאמא תדע ממי)</label><input type="text" id="giftName"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" id="giftClaimCancel">ביטול</button><button type="button" class="btn primary" id="giftClaimGo">אישור</button></div>`);
  $('#giftClaimCancel').onclick = closeModal;
  $('#giftClaimGo').onclick = () => giftClaim(lineKey, Math.max(1, Math.min(remaining, +$('#giftQty').value || 1)), $('#giftName').value || '', token);
}
async function giftClaim(lineKey, qty, giverName, token){
  try {
    const r = await fetch(APP_PROXY_BASE + 'gift-claim', {method:'POST', credentials:'same-origin', headers:{'content-type':'application/json'}, body: JSON.stringify({token, lineKey, qty, giverName})});
    const d = await r.json();
    closeModal();
    if (!d || !d.ok) { toast(d && d.error === 'oversubscribed' ? ('מישהי כבר תפסה בדיוק עכשיו — נשארו ' + d.remaining) : 'לא הצלחנו לשמור, לנסות שוב'); bootGiftView(token); return; }
    const mine = giftLocalGet(token); mine[lineKey] = d.entryId; giftLocalSet(token, mine);
    toast('תודה! נשמר'); bootGiftView(token);
  } catch(e) { closeModal(); toast('בעיית חיבור — לנסות שוב'); }
}
async function giftUnclaim(lineKey, token){
  const mine = giftLocalGet(token); const entryId = mine[lineKey]; if (!entryId) return;
  try {
    await fetch(APP_PROXY_BASE + 'gift-unclaim', {method:'POST', credentials:'same-origin', headers:{'content-type':'application/json'}, body: JSON.stringify({token, lineKey, entryId})});
  } catch(e) {}
  delete mine[lineKey]; giftLocalSet(token, mine);
  toast('בוטל'); bootGiftView(token);
}

/* ---------- הגדרות ---------- */
$('#btnSettings').onclick = () => {
  openModal(`<h2>הגדרות</h2><p>מחובר/ת לחשבון בחנות.</p>
    <div style="display:grid;gap:8px">${waLinkFor(S.profile?.due) ? `<a class="btn soft" id="optWa" href="${esc(waLinkFor(S.profile.due))}" target="_blank" rel="noopener">קבוצת הוואטסאפ של משוערות ${esc(waMonthName(S.profile.due))}</a>` : ''}<button type="button" class="btn soft" id="optTour">הדרכה — איך עובדים עם הכלי</button><button type="button" class="btn soft" id="optProfile">שינוי תאריך / תאומים</button><button type="button" class="btn soft" id="optSignOut">יציאה מהחשבון</button><button type="button" class="btn ghost" id="optClose">סגירה</button></div>
    <p class="why" style="text-align:center">גרסת נתונים ${VERSION.v} · ${MODELS.length.toLocaleString('he-IL')} מוצרים</p>`);
  $('#optTour').onclick = () => { closeModal(); openTour(); };
  $('#optProfile').onclick = () => { closeModal(); editProfile(); };
  $('#optSignOut').onclick = () => { closeModal(); Identity.signOut(); USER = null; S = EMPTY(); OB.step = 0; renderOnboard(); toast('יצאתם מהחשבון'); };
  $('#optClose').onclick = closeModal;
};

/* =====================================================================
   הפעלה
   ===================================================================== */
async function boot(){
  showScreen('screen-loading');
  try { await loadData(); }
  catch (e) { $('#errMsg').textContent = 'כדאי לבדוק שיש חיבור לאינטרנט ולנסות שוב. (' + e.message + ')'; showScreen('screen-error'); return; }
  // עמוד מתנות לאורח/ת — קישור עם ?gift=<טוקן>, בלי חשבון ובלי מסך הרשמה כלל.
  const giftToken = new URL(location.href).searchParams.get('gift');
  if (giftToken) { $('#btnRetry').onclick = () => bootGiftView(giftToken); bootGiftView(giftToken); return; }
  const draftBack = Identity.completeSignIn();    // האם חזרנו מהתחברות (יש טיוטה מקודדת בכתובת)?
  USER = await Identity.current();                // מי מחובר/ת עכשיו, לפי שופיפיי
  IS_ADMIN = !!(USER && USER.admin);
  if (draftBack) {
    if (USER) {
      S = mergeDraft(await Identity.loadList(), draftBack.draft);
      save();
      if (!S.profile) { renderOnboard(); return; }
      enterApp(); toast('ההרשמה הושלמה — הרשימה נשמרה');
      return;
    }
    // חזרנו מדף ההתחברות אבל אין זיהוי (למשל ההתחברות בוטלה) — נשארים עם הטיוטה במסך ההרשמה
    S = normalize(draftBack.draft || EMPTY()); renderSignIn(); return;
  }
  if (USER) {
    S = normalize(await Identity.loadList());
    if (!S.profile) { renderOnboard(); return; }
    enterApp(); return;
  }
  const draft = ls.get('bl_draft');
  if (draft?.profile) { S = normalize(draft); renderSignIn(); return; }
  S = EMPTY(); OB.step = 0; renderOnboard();
}
/* פס ה"תצוגה מקדימה" של שופיפיי יושב על הבר התחתון — מרימים את הרכיבים הקבועים מעליו */
function liftAboveShopifyBar(){ const pb = document.getElementById('PBarNextFrameWrapper') || document.getElementById('preview-bar-iframe') || document.querySelector('.shopify-preview-bar'); document.body.style.setProperty('--bl-pb', (pb ? Math.ceil(pb.getBoundingClientRect().height) : 0) + 'px'); }
liftAboveShopifyBar(); setTimeout(liftAboveShopifyBar, 1500); setTimeout(liftAboveShopifyBar, 4000); addEventListener('resize', liftAboveShopifyBar);
$('#btnRetry').onclick = boot;
boot();
})();
