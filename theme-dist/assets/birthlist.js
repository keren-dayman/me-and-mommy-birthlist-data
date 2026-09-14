/* נבנה אוטומטית מ-ui/birthlist.html על ידי build_theme.py — לא לערוך ידנית */
(() => {
'use strict';
/* =====================================================================
   הגדרות — כל מה שדניאל שולט בו נמצא כאן, ורק כאן
   ===================================================================== */
const CONFIG = {
  // 🔑 כתובת הנתונים — הקבוע היחיד. מעבר ל-Cloudflare = שינוי השורה הזו בלבד.
  DATA_BASE: 'https://keren-dayman.github.io/me-and-mommy-birthlist-data/',
  // תמונות מוצרים — מתג אחד לכולם. אין מתג למשתמשים.
  SHOW_IMAGES: true,
  // מחיר שנבדק לפני יותר מ-X ימים: מ-WARN מציגים אזהרה, מ-HIDE לא מציגים בכלל.
  STALE_WARN_DAYS: 7,
  STALE_HIDE_DAYS: 30,
  MODELS_PAGE: 30,              // כמה מוצרים מציגים בכל פעם בגלריה
  MAX_MONTHS: 10,               // תקרה לפריסה חודשית
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
const brandName = b => (!b || b.includes(':')) ? '' : (BRAND_NAMES[b] || b);
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
   בשלב E: הדמיה (localStorage). בשלב G מחליפים את המודול הזה בלבד:
   signIn → מעבר לדף ההתחברות של Shopify, loadList/saveList → App Proxy.
   הממשק לא יודע ולא צריך לדעת מה מאחורי הפונקציות האלה.
   ===================================================================== */
const Identity = (() => {
  const KEY_USER = 'bl_user', KEY_DRAFT = 'bl_draft', listKey = uid => 'bl_list_' + uid;
  return {
    mode: 'mock',
    current(){ return ls.get(KEY_USER); },
    // יציאה להרשמה. draft = כל מה שמולא עד עכשיו — חייב לשרוד את היציאה מהעמוד.
    // נשמר בשני מקומות: באחסון המקומי, וגם בכתובת החזרה (למקרה שהאחסון נמחק).
    signIn(provider, draft){
      ls.set(KEY_DRAFT, draft);
      const u = new URL(location.href);
      u.searchParams.set('auth', provider);       // בדמו: חוזרים לאותו עמוד עם סימון
      u.hash = 'd=' + b64e(JSON.stringify(draft));
      location.href = u.toString();
    },
    // נקרא בכל טעינה: אם חזרנו מהרשמה — יוצר את המשתמש/ת ומחזיר את הטיוטה ששרדה
    completeSignIn(){
      const u = new URL(location.href), p = u.searchParams.get('auth');
      if (!p) return null;
      let draft = null;
      const m = /(?:^|[#&])d=([^&]+)/.exec(u.hash);
      if (m) { try { draft = JSON.parse(b64d(m[1])); } catch(e) {} }
      draft = draft || ls.get(KEY_DRAFT); ls.del(KEY_DRAFT);
      const user = {id:'mock-' + p, provider:p, name:''};
      ls.set(KEY_USER, user);
      try { history.replaceState(null, '', u.pathname + u.search.replace(/[?&]auth=[^&]*/,'').replace(/^&/,'?')); } catch(e) {}
      return {user, draft};
    },
    signOut(){ ls.del(KEY_USER); ls.del(KEY_DRAFT); },
    async loadList(uid){ return ls.get(listKey(uid)); },
    async saveList(uid, list){ ls.set(listKey(uid), list); },
  };
})();

/* =====================================================================
   טעינת הנתונים — תמיד שתי משיכות, בסדר הזה (מסמך 23 פרק 2)
   ===================================================================== */
let DATA = null, VERSION = null, STORES = {}, ITEMS = [], MODELS = [], CATS = [];
const modelsByItem = {}, modelById = {}, itemById = {};

async function loadData(){
  const ver = await fetch(CONFIG.DATA_BASE + 'bl_version.json?t=' + Date.now(), {cache:'no-store'}).then(r => { if (!r.ok) throw new Error('version ' + r.status); return r.json(); });
  const data = await fetch(CONFIG.DATA_BASE + 'bl_data.json?v=' + ver.v).then(r => { if (!r.ok) throw new Error('data ' + r.status); return r.json(); });
  if (!data.items || !data.models || !data.stores) throw new Error('bad data');
  VERSION = ver; DATA = data; prepareData();
}
function prepareData(){
  STORES = DATA.stores;
  for (const [k, s] of Object.entries(STORES)) { s.id = k; s.days = daysAgo(s.d); s.hidden = s.days > CONFIG.STALE_HIDE_DAYS; s.stale = s.days > CONFIG.STALE_WARN_DAYS; }
  ITEMS = DATA.items.slice().sort((a, b) => a.id - b.id);
  ITEMS.forEach(i => { itemById[i.id] = i; modelsByItem[i.id] = []; });
  CATS = [...new Set(ITEMS.map(i => i.c))];
  MODELS = [];
  for (const m of DATA.models) {
    m.offers = Object.entries(m.o).filter(([sid]) => STORES[sid] && !STORES[sid].hidden)
      .map(([sid, o]) => ({sid, p:o.p, px:o.px, a:o.a === 1, u:o.u}))
      .sort((a, b) => (a.p - b.p) || (b.a - a.a));
    if (!m.offers.length) continue;
    m.best = m.offers[0];
    m.min = m.offers[0].p;
    m.maxP = Math.max(...m.offers.map(o => o.p));
    m.nStores = m.offers.length;
    m.brand = brandName(m.b);
    modelById[m.id] = m;
    if (modelsByItem[m.i]) { modelsByItem[m.i].push(m); MODELS.push(m); }
  }
  for (const list of Object.values(modelsByItem)) list.sort((a, b) => a.min - b.min || a.n.localeCompare(b.n, 'he'));
}

/* =====================================================================
   מצב המשתמש/ת
   sel[itemId] = [ {id, m, s, q, who, name, sname} ]   — אפשר כמה מוצרים לאותו פריט
   custom = [ {id, i, c, name, store, price, url, q, who} ] — מוצרים שהוספו ידנית (i = פריט, או null)
   ===================================================================== */
const EMPTY = () => ({ profile:null, sel:{}, have:{}, custom:[], open:null });
let USER = null, S = EMPTY();
let UI = { filter:'all', q:'', view:'list' };
let saveT;
function save(){ if (!USER) return; clearTimeout(saveT); saveT = setTimeout(flushSave, 150); }
function flushSave(){ clearTimeout(saveT); saveT = null; if (USER) Identity.saveList(USER.id, S); }
window.addEventListener('pagehide', () => { if (saveT) flushSave(); });
// מיישר רשימה מכל גרסה לצורה הנוכחית
function normalize(st){
  const out = EMPTY(); if (!st) return out;
  out.profile = st.profile || null; out.open = st.open ?? null; out.have = {...(st.have || {}), ...(st.skip || {})};
  out.custom = Array.isArray(st.custom) ? st.custom : [];
  for (const [k, v] of Object.entries(st.sel || {})) { const arr = Array.isArray(v) ? v : (v ? [v] : []); out.sel[k] = arr.map(p => ({id: p.id || uid(), who: p.who || 'me', ...p})); if (!out.sel[k].length) delete out.sel[k]; }
  return out;
}
function mergeDraft(base, draft){
  const out = normalize(base); if (!draft) return out; const d = normalize(draft);
  if (d.profile) out.profile = d.profile;
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
const ART = {
  hello: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--peach-soft)"/><circle cx="80" cy="70" r="26" fill="var(--surface)"/><circle cx="70" cy="66" r="3" fill="var(--ink)"/><circle cx="90" cy="66" r="3" fill="var(--ink)"/><path d="M70 78q10 8 20 0" stroke="var(--peach-deep)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 122q30-30 60 0" fill="var(--surface)"/><circle cx="118" cy="46" r="6" fill="var(--peach)"/><circle cx="40" cy="50" r="4" fill="var(--sage)"/><circle cx="128" cy="100" r="4" fill="var(--sky)"/></svg>`,
  date: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--sky-soft)"/><rect x="42" y="50" width="76" height="66" rx="12" fill="var(--surface)"/><rect x="42" y="50" width="76" height="20" rx="12" fill="var(--peach)"/><circle cx="60" cy="88" r="5" fill="var(--line)"/><circle cx="80" cy="88" r="5" fill="var(--line)"/><circle cx="100" cy="88" r="7" fill="var(--peach-deep)"/><circle cx="60" cy="104" r="5" fill="var(--line)"/><circle cx="80" cy="104" r="5" fill="var(--line)"/></svg>`,
  first: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--sage-soft)"/><path d="M80 118s-34-20-34-44a17 17 0 0134-6 17 17 0 0134 6c0 24-34 44-34 44z" fill="var(--peach)"/><path d="M80 118s-34-20-34-44a17 17 0 0134-6" fill="none" stroke="var(--surface)" stroke-width="4" stroke-linecap="round"/></svg>`,
  lock: `<svg class="art" viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="var(--peach-soft)"/><rect x="50" y="72" width="60" height="48" rx="12" fill="var(--surface)"/><path d="M62 72V60a18 18 0 0136 0v12" fill="none" stroke="var(--peach-deep)" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="96" r="6" fill="var(--peach-deep)"/></svg>`,
};
for (const k of Object.keys(ART)) if (BL_SETTINGS.img && BL_SETTINGS.img[k]) ART[k] = `<img class="art" src="${esc(BL_SETTINGS.img[k])}" alt="" loading="lazy">`;
function renderOnboard(){
  showScreen('screen-onboard');
  const el = $('#screen-onboard');
  const months = []; for (let i = 0; i < 10; i++) { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1); months.push({v: d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'), t: MONTHS_HE[d.getMonth()], yy: d.getFullYear()}); }
  const dots = `<div class="dots" aria-hidden="true">${[0,1,2].map(i => `<i class="${OB.step===i?'on':''}"></i>`).join('')}</div>`;
  let body = '';
  if (OB.step === 0) body = `${ART.hello}<h1>${T("ob0_title", "היי, ברוכים הבאים 🌸")}</h1><p class="lead">${T('ob0_lead', "בעוד רגע תהיה לכם רשימה מסודרת של כל מה שצריך ללידה — עם מחירים אמיתיים מ-{stores} חנויות, והכי זול מסומן.").replace('{stores}', Object.keys(STORES).length)}</p><p class="lead" style="font-size:15px">${T("ob0_sub", "שתי שאלות קצרות, ומתחילים.")}</p><div class="nav"><button class="btn primary big" id="obNext">${T("ob0_btn", "מתחילים")}</button></div>`;
  if (OB.step === 1) body = `${ART.date}<h1>${T("ob1_title", "מתי התאריך המשוער?")}</h1><p class="lead">${T("ob1_lead", "לפי זה נפרוס את הקניות על החודשים שנשארו.")}</p>
    <div class="month-grid" id="obMonths">${months.map(m => `<button type="button" data-v="${m.v}" aria-pressed="${OB.due?.slice(0,7)===m.v}">${m.t}<br><small style="color:var(--muted);font-weight:400">${m.yy}</small></button>`).join('')}</div>
    <div class="day-row"><label for="obDay" style="font-weight:600">יום</label><select id="obDay">${Array.from({length:31},(_, i) => `<option value="${i+1}" ${OB.due && +OB.due.slice(8)===i+1?'selected':''}>${i+1}</option>`).join('')}</select><span class="muted" style="font-size:14px">לא בטוח/ה? אפשר בערך</span></div>
    <div class="toggle"><span>תאומים או יותר? 👶👶</span><button type="button" class="switch" id="obTwins" role="switch" aria-checked="${OB.twins}" aria-label="תאומים"></button></div>
    <div class="nav"><button class="btn ghost" id="obBack" aria-label="חזרה">${ic('i-back')}</button><button class="btn primary big" id="obNext" ${OB.due?'':'disabled'}>המשך</button></div>`;
  if (OB.step === 2) body = `${ART.first}<h1>${T("ob2_title", "זו הלידה הראשונה?")}</h1><p class="lead">${T("ob2_lead", "ככה נדע כמה להסביר, ומה כנראה כבר יש בבית.")}</p>
    <div class="opts"><button type="button" class="opt" data-f="1" aria-pressed="${OB.first}"><span class="em">🌱</span><span>כן, לידה ראשונה<small>נלווה אתכם צעד־צעד</small></span></button><button type="button" class="opt" data-f="0" aria-pressed="${!OB.first}"><span class="em">👧</span><span>כבר יש ילדים בבית<small>אפשר לסמן מהר "כבר יש לי"</small></span></button></div>
    <div class="nav"><button class="btn ghost" id="obBack" aria-label="חזרה">${ic('i-back')}</button><button class="btn primary big" id="obNext">${T("ob2_btn", "בונים את הרשימה ✨")}</button></div><p class="tiny">אפשר לשנות הכול אחר כך.</p>`;
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span>${dots}</div><div class="step">${body}</div>`;
  $('#obBack', el)?.addEventListener('click', () => { OB.step--; renderOnboard(); });
  $$('#obMonths button', el).forEach(b => b.onclick = () => { OB.due = b.dataset.v + '-' + String($('#obDay').value).padStart(2,'0'); renderOnboard(); });
  $('#obDay', el)?.addEventListener('change', e => { if (OB.due) OB.due = OB.due.slice(0,7) + '-' + String(e.target.value).padStart(2,'0'); });
  $('#obTwins', el)?.addEventListener('click', e => { OB.twins = !OB.twins; e.currentTarget.setAttribute('aria-checked', OB.twins); });
  $$('.opt', el).forEach(b => b.onclick = () => { OB.first = b.dataset.f === '1'; $$('.opt', el).forEach(x => x.setAttribute('aria-pressed', x === b)); });
  $('#obNext', el).onclick = () => {
    if (OB.step < 2) { OB.step++; renderOnboard(); return; }
    const editing = !!S.profile;
    S.profile = { due: OB.due, twins: OB.twins, first: OB.first };
    if (editing) { save(); enterApp(); toast('הפרטים עודכנו'); return; }
    ls.set('bl_draft', S);           // הטיוטה נשמרת כבר עכשיו — עוד לפני ההרשמה
    renderBuild();
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
    if (i >= ITEMS.length) { bar.style.width = '100%'; btn.disabled = false; btn.textContent = T('build_btn', 'הרשימה מוכנה — לשמור אותה'); return; }
    const it = ITEMS[i++]; const n = (modelsByItem[it.id] || []).length;
    const row = document.createElement('div'); row.innerHTML = `<i>✓</i><span>${esc(it.n)}</span><small>${n ? `${n} מוצרים` : ''}</small>`;
    list.prepend(row); while (list.children.length > 9) list.lastChild.remove();
    bar.style.width = Math.round(i / ITEMS.length * 100) + '%';
    setTimeout(tick, 45);
  };
  tick();
  btn.onclick = renderSignIn;
  list.onclick = () => { i = ITEMS.length; };
}

/* ---------- 3. הרשמה (אין מצב אורח/ת) ---------- */
const PROVIDERS = [
  {id:'google', cls:'google', label:'להמשיך עם Google', svg:`<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.5-1.5-.5-3.1 0-4.6V6.6H1.2c-1.6 3.3-1.6 7.2 0 10.5l4.1-2.8z"/><path fill="#EA4335" d="M12 4.7c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.1 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-5 6.7-5z"/></svg>`},
  {id:'apple', cls:'apple', label:'להמשיך עם Apple', svg:`<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.9-1.7 0-3.2 1-4.1 2.5-1.8 3-.5 7.5 1.3 10 .9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-3.1-3.9zM14 5.2c.7-.8 1.2-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.3z"/></svg>`},
  {id:'shop', cls:'shop', label:'להמשיך עם Shop', svg:`<svg viewBox="0 0 24 24"><path d="M3 5h4l2 9h9l2-6H8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`},
];
function renderSignIn(){
  showScreen('screen-signin');
  const el = $('#screen-signin');
  const nSel = Object.values(S.sel).reduce((a, v) => a + v.length, 0), nHave = Object.keys(S.have).length;
  el.innerHTML = `<div class="top"><span class="brand">${T('brand', 'me &amp; mommy')}</span></div><div class="step">${ART.lock}
    <h1>${T("signin_title", "הרשימה מוכנה 🌸")}</h1>
    <p class="lead">${T("signin_lead", "כדי שהיא תישמר ותחכה לכם מכל מכשיר — נרשמים בלחיצה אחת.")}</p>
    <div class="summary-box"><span>תאריך משוער: <b>${esc(dueText())}</b>${S.profile?.twins ? ' · תאומים 👶👶' : ''}</span><span>${ITEMS.length} פריטים · ${MODELS.length.toLocaleString('he-IL')} מוצרים עם מחיר חי${nSel || nHave ? ` · כבר סומנו ${nSel + nHave}` : ''}</span></div>
    <div class="auth">${PROVIDERS.map(p => `<button type="button" class="auth-btn ${p.cls}" data-p="${p.id}">${p.svg}<span>${p.label}</span></button>`).join('')}
      <div class="or">או</div>
      <button type="button" class="auth-btn email" data-p="email">✉️ <span>עם מייל וקוד חד־פעמי</span></button></div>
    <p class="tiny">${T("signin_tiny", "בלי סיסמאות. הפרטים לא נמסרים לאף חנות.")}</p>
    <div class="demo-note">דמו: בגרסה הסופית הכפתורים מעבירים להתחברות של החנות (${CONFIG.STORE_HOME.replace('https://','')}) וחוזרים לכאן. גם בדמו העמוד באמת יוצא וחוזר — כדי לוודא שהתשובות שורדות.</div>
  </div>`;
  $$('.auth-btn', el).forEach(b => b.onclick = () => Identity.signIn(b.dataset.p, S));
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
  $('#footNote').innerHTML = `המחירים נבדקו בחנויות: ${Object.values(STORES).filter(s => !s.hidden).map(s => `${esc(s.n)} ${fmtDate(s.d)}`).join(' · ')}.<br>מזהה גרסה: ${VERSION.v}. המחיר הסופי הוא תמיד המחיר באתר החנות.`;
  renderAll();
}
function renderAll(){ renderList(); showView(UI.view); }
function showView(v){ UI.view = v; $$('#tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.view === v)); $$('section.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v)); $('#fabAdd').hidden = v !== 'list'; if (v === 'budget') renderBudget(); if (v === 'months') renderMonths(); if (v === 'gifts') renderGifts(); window.scrollTo({top:0}); }
$$('#tabs [role=tab]').forEach(b => b.onclick = () => showView(b.dataset.view));
$('#fabAdd').onclick = () => openManual(null);

/* ---------- שורות הרשימה (כל מה שנבחר, מכל הסוגים) ---------- */
function lines(){
  const out = [];
  for (const [iid, picks] of Object.entries(S.sel)) {
    const it = itemById[iid]; if (!it || S.have[iid]) continue;
    for (const p of picks) {
      const m = modelById[p.m]; const o = m && m.offers.find(x => x.sid === p.s);
      if (!m || !o) { out.push({key:'p' + p.id, pick:p, itemId:+iid, item:it, cat:it.c, name:p.name || it.n, store:p.sname || '', price:0, qty:p.q || 1, who:p.who || 'me', missing:true, model:null}); continue; }
      out.push({key:'p' + p.id, pick:p, itemId:+iid, item:it, cat:it.c, name:m.n, brand:m.brand, store:STORES[o.sid].n, sid:o.sid, price:(p.pp != null ? +p.pp : o.p), storeP:o.p, personal:p.pp != null, px:o.px, qty:p.q || 1, who:p.who || 'me', model:m, offer:o, url:o.u, img:m.img});
    }
  }
  for (const c of S.custom) { const it = c.i ? itemById[c.i] : null; if (it && S.have[it.id]) continue; out.push({key:'c' + c.id, custom:c, itemId:c.i || null, item:it, cat:it ? it.c : c.c, name:c.name, store:c.store || 'חנות אחרת', price:+c.price || 0, qty:c.q || 1, who:c.who || 'me', url:c.url, model:null}); }
  return out;
}
const total = ls => ls.reduce((a, l) => a + l.price * l.qty, 0);
const mine = ls => ls.filter(l => l.who === 'me');
const handled = it => (S.sel[it.id]?.length) || S.have[it.id] || S.custom.some(c => c.i === it.id);

function renderHeader(){
  $('#helloTitle').textContent = 'הרשימה שלי';
  const w = weeksLeft();
  $('#helloSub').textContent = w === null ? '' : w > 0 ? `עוד ${w} שבועות · תאריך משוער ${dueText()}` : 'התאריך המשוער עבר — בהצלחה! 🎉';
}
function renderHero(){
  const ls_ = lines(), me = mine(ls_), gifts = ls_.filter(l => l.who === 'gift'), done = ITEMS.filter(handled).length, pct = Math.round(done / ITEMS.length * 100);
  const must = ITEMS.filter(i => i.t === 'חובה'), mustDone = must.filter(handled).length, r = 36, c = 2 * Math.PI * r;
  $('#hero').innerHTML = `<div class="ring" role="img" aria-label="${pct}% מהרשימה טופלו"><svg viewBox="0 0 84 84"><circle class="bgc" cx="42" cy="42" r="${r}"/><circle class="fgc" cx="42" cy="42" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct/100)}"/></svg><b class="num">${pct}%</b></div>
    <div class="txt"><h2>${pct === 0 ? 'מתחילים מהחובה 💪' : pct < 100 ? (mustDone === must.length ? 'כל החובה סגורה — יופי!' : 'ממשיכים יפה') : 'הרשימה מלאה! 🎉'}</h2><p>${mustDone} מתוך ${must.length} פריטי חובה טופלו</p><div class="stats"><span>אני קונה <b class="num">${nis(total(me))}</b></span><span>במתנה <b class="num">${gifts.length}</b></span></div></div>`;
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
    return `<div class="cat" data-cat="${esc(cat)}" ${open?'open':''}><button type="button" class="hd" aria-expanded="${open}"><header><span class="ico" style="background:var(--surface-2)">${CAT_EMOJI[cat] || '🍼'}</span><span class="t"><h2>${esc(cat)}</h2><span class="prog num">${done === its.length ? '✓ הכול טופל' : `${done} מתוך ${its.length} טופלו`}</span></span><svg class="chev"><use href="#i-chev"/></svg></header></button>
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
    <div class="row">${storeChip(o.sid)}<span class="qty" aria-label="כמות"><button type="button" data-act="qty" data-key="${key}" data-d="-1" aria-label="פחות">−</button><span class="num">${q}</span><button type="button" data-act="qty" data-key="${key}" data-d="1" aria-label="יותר">+</button></span>${q > 1 ? `<span class="muted" style="font-size:13px">${my ? nis(unit) : priceLabel(o)} ליח׳</span>` : ''}<a href="${esc(o.u)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600">לחנות ↗</a><button type="button" class="btn small ghost" data-act="remove" data-key="${key}" style="color:var(--rose)">הסרה</button></div>
    ${whoRow(key, p.who || 'me')}</div>`;
}
function renderCustomPick(c){
  const key = 'c' + c.id, q = c.q || 1;
  return `<div class="pick" data-key="${key}"><span class="thumb">${ic('i-bottle')}</span><div class="top"><span><b>${esc(c.name)}</b><span class="v">${esc(c.store || 'חנות אחרת')} · הוספה ידנית</span></span><span class="price num">${nis((+c.price || 0) * q)}<button type="button" class="pedit" data-act="price" data-key="${key}" title="עריכת מחיר" aria-label="עריכת מחיר">✎</button></span></div>
    <div class="row"><span class="qty" aria-label="כמות"><button type="button" data-act="qty" data-key="${key}" data-d="-1" aria-label="פחות">−</button><span class="num">${q}</span><button type="button" data-act="qty" data-key="${key}" data-d="1" aria-label="יותר">+</button></span>${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener" style="font-size:14px;font-weight:600">לחנות ↗</a>` : ''}<button type="button" class="btn small ghost" data-act="remove" data-key="${key}" style="color:var(--rose)">הסרה</button></div>
    ${whoRow(key, c.who || 'me')}</div>`;
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
    if (t.who === 'gift') toast('עבר לרשימת המתנות 🎁');
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
const MS = { item:null, brand:'all', sort:'cheap', q:'', page:1 };
function openModels(itemId){
  MS.item = itemId; MS.brand = 'all'; MS.sort = 'cheap'; MS.q = ''; MS.page = 1;
  openSheet(`<div class="head"><div><h2>${esc(itemById[itemId].n)}</h2><div class="sub" id="msSub"></div></div><button type="button" class="btn soft small" data-close>סגירה</button></div>
    <div class="body"><div class="toolbar"><div class="searchbox"><input id="msQ" type="search" placeholder="חיפוש מוצר או מותג…" aria-label="חיפוש מוצר"><svg><use href="#i-search"/></svg></div><select id="msSort" aria-label="מיון"><option value="cheap">מהזול ליקר</option><option value="exp">מהיקר לזול</option><option value="stores">קודם מה שבכמה חנויות</option><option value="brand">לפי מותג</option></select></div>
    <div class="chips" id="msBrands"></div><div id="msList"></div></div>`);
  $('[data-close]', $('#sheet')).onclick = closeSheet;
  $('#msQ').oninput = e => { MS.q = e.target.value.trim().toLowerCase(); MS.page = 1; renderModels(); };
  $('#msSort').onchange = e => { MS.sort = e.target.value; MS.page = 1; renderModels(); };
  renderModels();
}
function renderModels(){
  const all = modelsByItem[MS.item] || [], byB = {}; all.forEach(m => { if (m.brand) byB[m.brand] = (byB[m.brand]||0) + 1; });
  const brands = Object.entries(byB).sort((a, b) => b[1] - a[1]).slice(0, 15);
  $('#msBrands').innerHTML = brands.length > 1 ? `<button type="button" class="chip" data-b="all" aria-pressed="${MS.brand==='all'}">כל המותגים<span class="n num">${all.length}</span></button>` + brands.map(([v, n]) => `<button type="button" class="chip" data-b="${esc(v)}" aria-pressed="${MS.brand===v}">${esc(v)}<span class="n num">${n}</span></button>`).join('') : '';
  $$('#msBrands .chip').forEach(b => b.onclick = () => { MS.brand = b.dataset.b; MS.page = 1; renderModels(); });
  const ms = all.filter(m => (MS.brand === 'all' || m.brand === MS.brand) && (!MS.q || (m.n + ' ' + m.brand).toLowerCase().includes(MS.q)));
  const sorters = { cheap: (a, b) => a.min - b.min, exp: (a, b) => b.min - a.min, brand: (a, b) => (a.brand || 'ת').localeCompare(b.brand || 'ת', 'he') || a.min - b.min, stores: (a, b) => b.nStores - a.nStores || a.min - b.min };
  ms.sort(sorters[MS.sort]);
  const multi = all.filter(m => m.nStores > 1).length;
  $('#msSub').textContent = `${ms.length} מוצרים${brands.length > 1 ? ` · ${Object.keys(byB).length} מותגים` : ''}${multi ? ` · ${multi} בכמה חנויות` : ''}`;
  const shown = ms.slice(0, MS.page * CONFIG.MODELS_PAGE);
  $('#msList').innerHTML = (shown.length ? `<div class="mgrid">${shown.map(m => `<button type="button" class="mcard" data-m="${esc(m.id)}">${thumb(m.img, 'pic', true)}<span class="t">${esc(m.n)}</span><span class="v">${esc(m.brand || '')}${m.cl?.length ? `${m.brand ? ' · ' : ''}${m.cl.length} צבעים` : ''}${!m.best.a ? `${m.brand || m.cl?.length ? ' · ' : ''}<span class="unavail">לבדוק זמינות</span>` : ''}</span><span class="pl"><span class="p num">${modelPriceLabel(m)}</span><span class="s ${m.nStores>1?'multi':''}">${m.nStores > 1 ? `ב-${m.nStores} חנויות` : esc(STORES[m.best.sid].n)}</span></span></button>`).join('')}</div>` : `<p class="notice">לא נמצאו מוצרים לחיפוש הזה.</p>`)
    + (ms.length > shown.length ? `<button type="button" class="more" id="msMore">להציג עוד ${Math.min(CONFIG.MODELS_PAGE, ms.length - shown.length)} מתוך ${ms.length - shown.length}</button>` : '');
  $$('#msList .mcard').forEach(b => b.onclick = () => openModel(b.dataset.m));
  $('#msMore')?.addEventListener('click', () => { MS.page++; renderModels(); });
}

/* ---------- מוצר אחד: השוואת המחירים בין החנויות ---------- */
function openModel(mid){
  const m = modelById[mid], it = itemById[m.i], picks = S.sel[it.id] || [];
  const many = m.offers.length > 1, nMin = m.offers.filter(o => o.p === m.min).length, allSame = nMin === m.offers.length;
  const body = m.offers.map(o => {
    const isBest = many && !allSame && o.p === m.min, diff = o.p - m.min, chosen = picks.some(p => p.m === m.id && p.s === o.sid);
    return `<div class="store ${isBest?'best':''}"><div class="l1"><span class="sc">${storeChip(o.sid)}${isBest ? '<span class="tag best">הכי זול</span>' : ''}${chosen ? '<span class="tag early">ברשימה</span>' : ''}</span><span class="p num">${priceLabel(o)}</span></div>
      <div class="meta"><span>${fmtChecked(STORES[o.sid].d)}${STORES[o.sid].stale ? ' ⚠️' : ''}</span>${isBest && m.maxP > m.min ? `<span style="color:var(--sage);font-weight:700">חיסכון של ${nis(m.maxP - m.min)} לעומת היקרה</span>` : (diff > 0 ? `<span>+${nis(diff)} מהזול</span>` : '')}${!o.a ? `<span class="unavail">לא מסומן במלאי — לבדוק בחנות</span>` : ''}${o.px && o.px > o.p ? `<span>טווח: ${nis(o.p)}–${nis(o.px)} לפי גודל/גרסה</span>` : ''}</div>
      <div class="acts"><button type="button" class="btn primary small" data-add="${esc(o.sid)}">${chosen ? 'להוסיף שוב' : 'הוספה לרשימה'}</button><a class="btn soft small" href="${esc(o.u)}" target="_blank" rel="noopener">לדף המוצר ↗</a></div></div>`; }).join('');
  openSheet(`<div class="head"><div><h2 style="font-size:18px">${esc(m.n)}</h2><div class="sub">${m.brand ? esc(m.brand) + ' · ' : ''}${esc(it.n)}</div></div><button type="button" class="btn soft small" data-back>${(modelsByItem[it.id].length > 1) ? ic('i-back') + ' למוצרים' : 'סגירה'}</button></div>
    <div class="body">${thumb(m.img, 'lg', true)}${m.cl?.length ? `<div class="colors">${m.cl.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
    ${many ? (allSame ? `<p class="notice" style="margin:0 0 12px">אותו מחיר ב-${m.offers.length} החנויות.</p>` : `<p class="notice info" style="margin:0 0 12px">נמכר ב-${m.offers.length} חנויות — המחיר הזול ביותר מסומן.</p>`) : `<p class="notice" style="margin:0 0 12px">נמצא בחנות אחת בלבד, אין השוואה.</p>`}${body}</div>`);
  $('[data-back]', $('#sheet')).onclick = () => (modelsByItem[it.id].length > 1) ? openModels(it.id) : closeSheet();
  $$('[data-add]', $('#sheet')).forEach(b => b.onclick = () => {
    const o = m.offers.find(x => x.sid === b.dataset.add);
    // נשמרים גם שם המוצר ושם החנות — כדי שאם המזהה ייעלם, נוכל להגיד "כבר לא זמין" (מסמך 23 פרק 6)
    (S.sel[it.id] ||= []).push({ id: uid(), m: m.id, s: o.sid, q: picks.length ? 1 : defaultQty(it), who:'me', name: m.n, sname: STORES[o.sid].n, i: it.id });
    delete S.have[it.id];
    save(); closeSheet(); rerenderItem(it.id); toast(`נוסף מ${STORES[o.sid].n} ✓`);
    $(`#cats .item[data-id="${it.id}"]`)?.scrollIntoView({block:'nearest'});
  });
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
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn soft" id="mfCancel">ביטול</button><button type="button" class="btn primary" id="mfSave">הוספה לרשימה</button></div>`);
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
  const ls_ = lines(), me = mine(ls_), sum = total(me), gifts = ls_.filter(l => l.who === 'gift'), given = ls_.filter(l => l.who === 'given');
  const byCat = {}; me.forEach(l => byCat[l.cat] = (byCat[l.cat]||0) + l.price*l.qty);
  const byStore = {}; me.forEach(l => byStore[l.store] = (byStore[l.store]||0) + l.price*l.qty);
  const saved = me.reduce((a, l) => a + (l.model && l.model.nStores > 1 ? (l.model.maxP - l.price) * l.qty : 0), 0);
  const open = ITEMS.filter(i => !handled(i)), openMust = open.filter(i => i.t === 'חובה');
  $('#view-budget').innerHTML = `<div class="card"><h3>כמה זה יוצא</h3><div class="bigline"><b class="num">${nis(sum)}</b><span class="muted">${me.length} מוצרים לקנייה</span></div>
      ${saved > 0 ? `<div style="font-size:14.5px;color:var(--sage);font-weight:700;margin-top:6px">חיסכון של ${nis(saved)} לעומת קנייה בחנות היקרה ביותר</div>` : ''}
      ${gifts.length || given.length ? `<div class="why" style="margin-top:6px">לא נספרים כאן: ${gifts.length ? `${gifts.length} במתנה (${nis(total(gifts))})` : ''}${gifts.length && given.length ? ' · ' : ''}${given.length ? `${given.length} שמגיעים במתנה` : ''}</div>` : ''}
      <p class="why">${open.length ? `עוד ${open.length} פריטים לא טופלו${openMust.length ? ` (${openMust.length} מהם חובה)` : ''} — הסכום יגדל.` : 'כל הפריטים טופלו 🎉'} מחירים לפי הבדיקה האחרונה; המחיר הסופי הוא באתר החנות.</p></div>
    <div class="card"><h3>לפי קטגוריה</h3><div class="kv">${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c, v]) => `<span>${CAT_EMOJI[c]||''} ${esc(c)}</span><span class="num" style="font-weight:700">${nis(v)}</span>`).join('') || '<span class="muted">עדיין לא נבחרו מוצרים</span>'}</div></div>
    <div class="card"><h3>לפי חנות</h3><div class="kv">${Object.entries(byStore).sort((a,b)=>b[1]-a[1]).map(([s, v]) => `<span>${esc(s)}</span><span class="num" style="font-weight:700">${nis(v)}</span>`).join('') || '<span class="muted">—</span>'}</div></div>
    <div class="card"><h3>הרשימה המלאה</h3><div class="tblwrap"><table><thead><tr><th>מוצר</th><th>חנות</th><th class="n">כמות</th><th class="n">סה״כ</th></tr></thead><tbody>${me.map(l => `<tr><td>${esc(l.name)}<br><small class="muted">${l.item ? esc(l.item.n) : esc(l.cat)}${l.brand ? ' · ' + esc(l.brand) : ''}</small></td><td>${esc(l.store)}</td><td class="n num">${l.qty}</td><td class="n num">${nis(l.price*l.qty)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">הרשימה ריקה עדיין</td></tr>'}</tbody></table></div></div>`;
}

/* ---------- לפי חודשים — לפי הטבלה BUY_MONTHS_BEFORE ---------- */
function monthsBefore(it, cat){ return it && BUY_MONTHS_BEFORE_ITEM[it.id] != null ? BUY_MONTHS_BEFORE_ITEM[it.id] : (BUY_MONTHS_BEFORE[cat] ?? 1); }
function monthPlan(){
  if (!S.profile?.due) return null;
  const due = new Date(S.profile.due + 'T00:00:00'), months = []; let d = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  while (d <= due && months.length < CONFIG.MAX_MONTHS) { months.push({ y: d.getFullYear(), m: d.getMonth(), items: [], sum: 0 }); d = new Date(d.getFullYear(), d.getMonth()+1, 1); }
  if (!months.length) months.push({ y: TODAY.getFullYear(), m: TODAY.getMonth(), items: [], sum: 0 });
  const n = months.length;
  const byItem = {}; lines().forEach(l => { const k = l.itemId || l.key; (byItem[k] ||= []).push(l); });
  const put = (it, cat, ls_, name) => { const nb = monthsBefore(it, cat), idx = Math.max(0, Math.min(n - 1, n - 1 - nb)), mo = months[idx];
    const me = mine(ls_); mo.items.push({ name, it, ls: ls_, nb }); mo.sum += total(me); };
  ITEMS.filter(i => !S.have[i.id]).forEach(it => put(it, it.c, byItem[it.id] || [], it.n));
  S.custom.filter(c => !c.i).forEach(c => put(null, c.c, byItem['c' + c.id] || [], c.name));
  months.forEach(mo => mo.items.sort((a, b) => (b.ls.length ? 1 : 0) - (a.ls.length ? 1 : 0)));
  return months;
}
function renderMonths(){
  const plan = monthPlan();
  if (!plan) { $('#view-months').innerHTML = `<div class="card"><p>כדי לפרוס את הקניות צריך תאריך לידה משוער. <button type="button" class="btn small" id="setDue">הגדרת תאריך</button></p></div>`; $('#setDue').onclick = editProfile; return; }
  const sum = plan.reduce((a, m) => a + m.sum, 0), nItems = plan.reduce((a, m) => a + m.items.length, 0);
  $('#view-months').innerHTML = `<div class="card"><div class="bigline"><b class="num">${nis(sum)}</b><span class="muted">${nItems} פריטים על פני ${plan.length} חודשים</span></div><p class="why">לפי ההמלצה של me &amp; mommy מתי לקנות כל קטגוריה. פריט בלי מחיר = עוד לא נבחר לו מוצר. <button type="button" class="btn small ghost" id="editDue" style="padding:2px 8px;color:var(--peach-ink)">תאריך: ${esc(dueText())} ✎</button></p></div>
    <div class="tl">${plan.map(m => `<div class="month"><div class="card"><header><h3>${MONTHS_HE[m.m]} ${m.y}</h3><b class="num">${nis(m.sum)}</b></header>${m.items.length ? `<ul>${m.items.map(({name, it, ls: ls_, nb}) => { const me = mine(ls_), others = ls_.length - me.length; return `<li class="${ls_.length?'':'open'}"><span><span class="n">${esc(name)}</span><small>${ls_.length ? `${ls_.map(l => esc(l.name)).join(' + ')}${others ? ` · ${others} במתנה` : ''}` : 'עוד לא נבחר מוצר'}${nb ? ` · מומלץ כ-${nb} חודשים לפני` : ' · סמוך ללידה'}</small></span><span class="num" style="font-weight:700">${ls_.length ? nis(total(me)) : (it ? '<button type="button" class="btn small soft" data-pick="' + it.id + '">לבחור</button>' : '')}</span></li>`; }).join('')}</ul>` : `<div class="why" style="margin:0">חודש חופשי — אין קניות</div>`}</div></div>`).join('')}</div>`;
  $('#editDue').onclick = editProfile;
  $$('#view-months [data-pick]').forEach(b => b.onclick = () => { const id = +b.dataset.pick, ms = modelsByItem[id] || []; if (!ms.length) return openManual(id); ms.length === 1 ? openModel(ms[0].id) : openModels(id); });
}

/* ---------- מתנות ---------- */
function giftText(gs){
  return `רשימת המתנות שלנו ללידה 🌸\n\n` + gs.map(g => `• ${g.name}${g.qty > 1 ? ` (×${g.qty})` : ''} — ${g.store}, ${nis(g.price)}${g.url ? `\n  ${g.url}` : ''}`).join('\n') + `\n\nתודה! ❤️`;
}
function renderGifts(){
  const ls_ = lines(), gs = ls_.filter(l => l.who === 'gift'), given = ls_.filter(l => l.who === 'given');
  const row = g => `<div class="gift">${thumb(g.img)}<span class="t">${esc(g.name)}</span><span class="p num">${nis(g.price * g.qty)}</span><span class="m">${esc(g.store)}${g.qty > 1 ? ` · ×${g.qty}` : ''}${g.item ? ` · ${esc(g.item.n)}` : ''}</span></div>`;
  $('#view-gifts').innerHTML = `<div class="card"><div class="bigline"><b class="num">${gs.length}</b><span class="muted">מתנות לבקש · שווי ${nis(total(gs))}</span></div>
      <div style="margin-top:14px"><button type="button" class="btn primary big" id="btnShareGifts" ${gs.length?'':'disabled'}>שיתוף רשימת המתנות</button></div>
      <p class="why">${gs.length ? 'הרשימה נשלחת כטקסט עם קישורים לחנויות — בוואטסאפ או בהעתקה.' : 'כדי לבקש מוצר במתנה: ברשימה, על מוצר שנבחר, לוחצים "לבקש במתנה".'}</p></div>
    ${gs.map(row).join('')}
    ${given.length ? `<div class="card" style="margin-top:16px"><h3>מגיע במתנה</h3><p class="why" style="margin:0 0 8px">מוצרים שמישהו כבר קונה — לא נספרים בסיכום.</p></div>${given.map(row).join('')}` : ''}`;
  $('#btnShareGifts').onclick = () => {
    const txt = giftText(gs);
    openModal(`<h2>רשימת המתנות</h2><p>אפשר לשלוח בוואטסאפ או להעתיק לכל מקום.</p><div class="linkbox"><textarea id="giftTxt" readonly>${esc(txt)}</textarea></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">שליחה בוואטסאפ</a><button type="button" class="btn" id="copyGift">העתקה</button><button type="button" class="btn soft" id="giftClose">סגירה</button></div>`);
    $('#copyGift').onclick = async () => { try { await navigator.clipboard.writeText(txt); toast('הרשימה הועתקה'); } catch(e) { $('#giftTxt').select(); toast('סמנו והעתיקו את הטקסט'); } };
    $('#giftClose').onclick = closeModal;
  };
}

/* ---------- הגדרות ---------- */
$('#btnSettings').onclick = () => {
  openModal(`<h2>הגדרות</h2><p>מחובר/ת דרך ${esc(USER?.provider || '')}.</p>
    <div style="display:grid;gap:8px"><button type="button" class="btn soft" id="optProfile">שינוי תאריך / תאומים</button><button type="button" class="btn soft" id="optSignOut">יציאה מהחשבון</button><button type="button" class="btn ghost" id="optClose">סגירה</button></div>
    <p class="why" style="text-align:center">גרסת נתונים ${VERSION.v} · ${MODELS.length.toLocaleString('he-IL')} מוצרים</p>`);
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
  const back = Identity.completeSignIn();
  if (back) {
    USER = back.user;
    S = mergeDraft(await Identity.loadList(USER.id), back.draft);
    save();
    if (!S.profile) { renderOnboard(); return; }
    enterApp(); toast('ההרשמה הושלמה — הרשימה נשמרה 🌸');
    return;
  }
  USER = Identity.current();
  if (USER) {
    S = normalize(await Identity.loadList(USER.id));
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
