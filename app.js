// ═══════════════════════════════════════════════════════════════════════════════
//  Plant Nutrient Guide — app.js
//  Firebase Auth + Firestore, multi-garden, collaborative
// ═══════════════════════════════════════════════════════════════════════════════

// ── Firebase config ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBVnbtX96m0o1NLqYynDkNwU9e3dVOemnY",
  authDomain: "mygarden-cc3d5.firebaseapp.com",
  projectId: "mygarden-cc3d5",
  storageBucket: "mygarden-cc3d5.firebasestorage.app",
  messagingSenderId: "489669016108",
  appId: "1:489669016108:web:1b11be28fd49f639b02f89"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// ── App state ──────────────────────────────────────────────────────────────────
let currentUser   = null;   // Firebase user
let currentGarden = null;   // { id, name, ownerId, members, inviteCode }
let data          = [];     // plant nutrient rows
let plantPrefs    = {};     // { plantName: { on, stage } }
let fertilizers   = [];     // fertilizer rows

let dataUnsub   = null;     // Firestore listener — plant data
let prefsUnsub  = null;     // Firestore listener — prefs
let gardenUnsub = null;     // Firestore listener — garden doc
let fertUnsub   = null;     // Firestore listener — fertilizers

// ── DOM helpers ────────────────────────────────────────────────────────────────
const gv  = id => document.getElementById(id);
const esc = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── Field accessors (matching original key names) ──────────────────────────────
const getN     = r => r['N\n(ratio)']    || '';
const getP     = r => r['P\n(ratio)']    || '';
const getK     = r => r['K\n(ratio)']    || '';
const getNmgl  = r => r['N\n(mg/L)']    || '';
const getPmgl  = r => r['P\n(mg/L)']    || '';
const getKmgl  = r => r['K\n(mg/L)']    || '';
const getCa    = r => r['Calcium (Ca)']  || '';
const getMg    = r => r['Magnesium (Mg)']|| '';
const getOther = r => r['Other Nutrients']|| '';
const getTips  = r => r['Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)'] || '';

// ── Fertilizer accessors / helpers ──────────────────────────────────────────────
function getFertById(id) { return fertilizers.find(f => f._docId === id) || null; }
function getFertNamesFor(row) {
  // row['_fertIds'] is an array of fertilizer docIds linked to this Plant+Stage row
  const ids = row && row['_fertIds'] ? row['_fertIds'] : [];
  return ids.map(id => getFertById(id)).filter(Boolean);
}

function stageBadgeClass(stage) {
  const s = (stage||'').toLowerCase();
  if (s.includes('seedling'))  return 'seedling';
  if (s.includes('flush'))     return 'flush';
  if (s.includes('year') || s.includes('herb') || s.includes('maintenance')) return 'year';
  if (s.includes('flower') || s.includes('fruit') || s.includes('bud') ||
      s.includes('pre-flower') || s.includes('swelling') || s.includes('tuber') ||
      s.includes('ripening')   || s.includes('colour'))  return 'fruit';
  return 'veg';
}

function getPlantNames() {
  const seen = new Set(), names = [];
  data.forEach(r => { if (!seen.has(r['Plant'])) { seen.add(r['Plant']); names.push(r['Plant']); }});
  return names;
}
function getStagesFor(name) { return data.filter(r => r['Plant']===name).map(r => r['Growth Stage']); }
function getRowFor(name, stage) { return data.find(r => r['Plant']===name && r['Growth Stage']===stage)||null; }

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════════════════
let authMode = 'signin';

function switchAuthTab(mode) {
  authMode = mode;
  gv('tab-signin').classList.toggle('active', mode==='signin');
  gv('tab-signup').classList.toggle('active', mode==='signup');
  gv('auth-name').style.display  = mode==='signup' ? '' : 'none';
  gv('auth-submit-btn').textContent = mode==='signin' ? 'Sign in' : 'Create account';
  gv('auth-error').textContent = '';
  if (gv('auth-hint')) gv('auth-hint').textContent = mode==='signin'
    ? 'Sign in to your myGarden account'
    : 'Create a new myGarden account';
}

async function handleAuth() {
  const email    = gv('auth-email').value.trim();
  const password = gv('auth-password').value;
  const name     = gv('auth-name').value.trim();
  gv('auth-error').textContent = '';
  try {
    if (authMode === 'signin') {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      if (!name) { gv('auth-error').textContent = 'Display name is required.'; return; }
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      // Best-effort save — don't block login if Firestore isn't ready yet
      db.collection('users').doc(cred.user.uid).set({ email, displayName: name }, { merge: true }).catch(() => {});
    }
  } catch(e) { gv('auth-error').textContent = friendlyError(e.code); }
}

async function handleGoogle() {
  gv('auth-error').textContent = '';
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    await db.collection('users').doc(cred.user.uid).set({
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email
    }, { merge: true });
  } catch(e) { gv('auth-error').textContent = friendlyError(e.code); }
}

function signOut() {
  teardownListeners();
  currentGarden = null;
  auth.signOut();
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':    'No account with that email.',
    'auth/wrong-password':    'Incorrect password.',
    'auth/email-already-in-use': 'Email already registered.',
    'auth/weak-password':     'Password must be at least 6 characters.',
    'auth/invalid-email':     'Invalid email address.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Try again.';
}

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    // Best-effort: save user doc so others can find them by email for invites
    db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || user.email
    }, { merge: true }).catch(() => {});
    showGardenScreen();
  } else {
    currentUser = null;
    showAuthScreen();
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN ROUTING
// ═══════════════════════════════════════════════════════════════════════════════
function showAuthScreen() {
  gv('auth-screen').style.display   = 'flex';
  gv('garden-screen').style.display = 'none';
  gv('app').style.display           = 'none';
}

function showGardenScreen() {
  teardownListeners();
  currentGarden = null;
  gv('auth-screen').style.display   = 'none';
  gv('garden-screen').style.display = 'flex';
  gv('app').style.display           = 'none';
  gv('garden-user-name').textContent  = currentUser.displayName || currentUser.email;
  gv('garden-user-email').textContent = currentUser.email;
  loadGardens();
}

function showApp() {
  gv('auth-screen').style.display   = 'none';
  gv('garden-screen').style.display = 'none';
  gv('app').style.display           = 'block';
  gv('nav-user-email').textContent  = currentUser.displayName || currentUser.email;
  gv('nav-garden-name').textContent = currentGarden.name;
  switchTab(0);
  setupListeners();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GARDEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function loadGardens() {
  gv('garden-list').innerHTML = '<div class="loading-spinner">Loading…</div>';
  try {
    const snap = await db.collection('gardens')
      .where('memberIds', 'array-contains', currentUser.uid)
      .get();

    if (snap.empty) {
      gv('garden-list').innerHTML = '<div class="garden-empty">You have no gardens yet. Create one below!</div>';
      return;
    }
    gv('garden-list').innerHTML = snap.docs.map(doc => {
      const g = doc.data();
      const isOwner = g.ownerId === currentUser.uid;
      const memberCount = (g.memberIds||[]).length;
      return `
        <div class="garden-item" onclick="openGarden('${doc.id}')">
          <div class="garden-item-icon">🌿</div>
          <div class="garden-item-info">
            <div class="garden-item-name">${esc(g.name)}</div>
            <div class="garden-item-meta">${memberCount} member${memberCount!==1?'s':''}</div>
          </div>
          ${isOwner ? '<span class="garden-item-role">Owner</span>' : '<span class="garden-item-role" style="background:var(--surface2);color:var(--text2)">Member</span>'}
        </div>`;
    }).join('');
  } catch(e) {
    gv('garden-list').innerHTML = `<div class="garden-empty">Error loading gardens: ${e.message}</div>`;
  }
}

async function createGarden() {
  const name = gv('new-garden-name').value.trim();
  if (!name) { showToast('Please enter a garden name.'); return; }
  try {
    const code = generateCode();
    const ref  = await db.collection('gardens').add({
      name,
      ownerId:   currentUser.uid,
      memberIds: [currentUser.uid],
      members: { [currentUser.uid]: { email: currentUser.email, displayName: currentUser.displayName||currentUser.email, role: 'owner' } },
      inviteCode: code,
      createdAt:  firebase.firestore.FieldValue.serverTimestamp()
    });
    // Seed default plant data
    const batch = db.batch();
    DEFAULT_DATA.forEach((row, i) => {
      const docRef = ref.collection('plants').doc(`plant_${i}`);
      batch.set(docRef, { ...row, _order: i });
    });
    await batch.commit();
    gv('new-garden-name').value = '';
    showToast(`Garden "${name}" created!`);
    openGarden(ref.id);
  } catch(e) { showToast('Error: ' + e.message); }
}

async function joinGarden() {
  const code = gv('join-code').value.trim().toUpperCase();
  if (!code) { showToast('Paste an invite code first.'); return; }
  try {
    // Query gardens by invite code — rules must allow read for auth'd users
    const snap = await db.collection('gardens').where('inviteCode','==',code).limit(1).get();
    if (snap.empty) { showToast('No garden found with that code.'); return; }
    const docRef = snap.docs[0].ref;
    const g      = snap.docs[0].data();
    if ((g.memberIds||[]).includes(currentUser.uid)) {
      showToast("You're already in that garden!");
      openGarden(snap.docs[0].id); return;
    }
    // Build the full updated members map to avoid permission issues with partial updates
    const newMembers = {
      ...(g.members || {}),
      [currentUser.uid]: {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email,
        role: 'member'
      }
    };
    const newMemberIds = [...(g.memberIds || []), currentUser.uid];
    await docRef.update({
      memberIds: newMemberIds,
      members: newMembers
    });
    gv('join-code').value = '';
    showToast(`Joined "${g.name}"!`);
    openGarden(snap.docs[0].id);
  } catch(e) {
    console.error('Join error:', e);
    showToast('Error joining: ' + e.message);
  }
}

async function openGarden(gardenId) {
  const snap = await db.collection('gardens').doc(gardenId).get();
  if (!snap.exists) { showToast('Garden not found.'); return; }
  currentGarden = { id: gardenId, ...snap.data() };
  showApp();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FIRESTORE LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════
function setupListeners() {
  const gardenRef = db.collection('gardens').doc(currentGarden.id);

  // Garden doc (members, name)
  gardenUnsub = gardenRef.onSnapshot(snap => {
    if (snap.exists) {
      currentGarden = { id: snap.id, ...snap.data() };
      gv('nav-garden-name').textContent = currentGarden.name;
      renderMembers();
    }
  });

  // Plant data
  dataUnsub = gardenRef.collection('plants')
    .onSnapshot(snap => {
      data = snap.docs.map(d => {
        const row = d.data();
        row._docId = d.id;
        return row;
      }).sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
      // Re-seed prefs for any new plants
      getPlantNames().forEach(name => {
        if (!plantPrefs[name]) {
          plantPrefs[name] = { on: true, stage: getStagesFor(name)[0]||'' };
        }
      });
      renderAll();
    });

  // Plant prefs (per-user, per-garden)
  const prefsRef = gardenRef.collection('prefs').doc(currentUser.uid);
  prefsUnsub = prefsRef.onSnapshot(snap => {
    plantPrefs = snap.exists ? (snap.data().prefs || {}) : {};
    // Seed any missing
    getPlantNames().forEach(name => {
      if (!plantPrefs[name]) {
        plantPrefs[name] = { on: true, stage: getStagesFor(name)[0]||'' };
      }
    });
    renderPlantDashboard();
    renderCards();
  });

  // Fertilizers
  fertUnsub = gardenRef.collection('fertilizers')
    .onSnapshot(snap => {
      fertilizers = snap.docs.map(d => {
        const row = d.data();
        row._docId = d.id;
        return row;
      }).sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
      renderFertilizers();
      renderCards();
    });
}

function teardownListeners() {
  if (dataUnsub)   { dataUnsub();   dataUnsub   = null; }
  if (prefsUnsub)  { prefsUnsub();  prefsUnsub  = null; }
  if (gardenUnsub) { gardenUnsub(); gardenUnsub = null; }
  if (fertUnsub)   { fertUnsub();   fertUnsub   = null; }
}

// ── Save helpers ───────────────────────────────────────────────────────────────
function savePrefs() {
  db.collection('gardens').doc(currentGarden.id)
    .collection('prefs').doc(currentUser.uid)
    .set({ prefs: plantPrefs }, { merge: true })
    .catch(e => showToast('Sync error: ' + e.message));
}

async function savePlantDoc(docId, rowData) {
  const ref = db.collection('gardens').doc(currentGarden.id).collection('plants').doc(docId);
  const { _docId, ...clean } = rowData;
  await ref.set(clean);
}

async function addPlantDoc(rowData) {
  const count = data.length;
  const ref = db.collection('gardens').doc(currentGarden.id).collection('plants').doc();
  const { _docId, ...clean } = rowData;
  await ref.set({ ...clean, _order: count });
}

async function deletePlantDoc(docId) {
  await db.collection('gardens').doc(currentGarden.id).collection('plants').doc(docId).delete();
}

// ── Fertilizer doc helpers ───────────────────────────────────────────────────────
async function saveFertDoc(docId, rowData) {
  const ref = db.collection('gardens').doc(currentGarden.id).collection('fertilizers').doc(docId);
  const { _docId, ...clean } = rowData;
  await ref.set(clean);
}

async function addFertDoc(rowData) {
  const count = fertilizers.length;
  const ref = db.collection('gardens').doc(currentGarden.id).collection('fertilizers').doc();
  const { _docId, ...clean } = rowData;
  await ref.set({ ...clean, _order: count });
  return ref.id;
}

async function deleteFertDoc(docId) {
  await db.collection('gardens').doc(currentGarden.id).collection('fertilizers').doc(docId).delete();
  // Unlink from any plant rows that referenced it as fertilizer
  const affectedFert = data.filter(r => (r['_fertIds']||[]).includes(docId));
  for (const row of affectedFert) {
    const newIds = (row['_fertIds']||[]).filter(id => id !== docId);
    await savePlantDoc(row._docId, { ...row, _fertIds: newIds });
  }
  // Unlink from any plant rows that referenced it as soil
  const affectedSoil = data.filter(r => (r['_soilIds']||[]).includes(docId));
  for (const row of affectedSoil) {
    const newIds = (row['_soilIds']||[]).filter(id => id !== docId);
    await savePlantDoc(row._docId, { ...row, _soilIds: newIds });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 1 — Plant Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
function renderPlantDashboard() {
  const search      = (gv('p1-search')?.value||'').toLowerCase();
  const names       = getPlantNames().filter(n => !search||n.toLowerCase().includes(search));
  const activeCount = getPlantNames().filter(n => plantPrefs[n]?.on).length;
  gv('p1-active-count').textContent = `${activeCount} active`;

  gv('plant-rows').innerHTML = names.map(name => {
    const pref   = plantPrefs[name] || { on: true, stage: getStagesFor(name)[0]||'' };
    const stages = getStagesFor(name);
    const emoji  = name.split(' ')[0];
    const label  = name.replace(/^\S+\s*/, '');
    const isOn   = pref.on;
    const opts   = stages.map(st =>
      `<option value="${esc(st)}" ${st===pref.stage?'selected':''}>${st.replace(/\n/g,' ')}</option>`
    ).join('');
    return `
      <div class="plant-row${isOn?'':' off'}">
        <label class="toggle">
          <input type="checkbox" ${isOn?'checked':''} onchange="togglePlant('${esc(name)}',this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <div class="plant-row-left">
          <div class="plant-row-emoji">${emoji}</div>
          <div class="plant-row-name">${label}<small>${data.find(r=>r['Plant']===name)?.['Genus']||''}</small></div>
        </div>
        <select class="plant-row-select" onchange="setPlantStage('${esc(name)}',this.value)">${opts}</select>
      </div>`;
  }).join('');
}

function togglePlant(name, on) {
  if (!plantPrefs[name]) plantPrefs[name] = { on: true, stage: getStagesFor(name)[0]||'' };
  plantPrefs[name].on = on;
  savePrefs();
  renderPlantDashboard();
  renderCards();
}

function setPlantStage(name, stage) {
  if (!plantPrefs[name]) plantPrefs[name] = { on: true, stage };
  plantPrefs[name].stage = stage;
  savePrefs();
  renderCards();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 2 — Cards
// ═══════════════════════════════════════════════════════════════════════════════
let cardCategory = 'All';

function setCardCategory(cat) {
  cardCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  renderCards();
}

function toggleCardDetails(cardEl) {
  cardEl.classList.toggle('expanded');
}

function renderCards() {
  const search = (gv('p2-search')?.value||'').toLowerCase();
  const rows   = [];
  getPlantNames().forEach(name => {
    const pref = plantPrefs[name];
    if (!pref?.on) return;
    const row = getRowFor(name, pref.stage);
    if (!row) return;
    if (search && !name.toLowerCase().includes(search) && !(row['Genus']||'').toLowerCase().includes(search)) return;
    rows.push(row);
  });

  // Build category list from plant names (emoji = category)
  const cats = ['All', ...new Set(rows.map(r => {
    const cat = r['Plant'].split(' ')[0]; // emoji
    return cat;
  }))];

  // Filter by category
  const filtered = cardCategory === 'All' ? rows : rows.filter(r => r['Plant'].startsWith(cardCategory));

  gv('p2-count').textContent = `(${filtered.length})`;

  // Render category pills
  const catBar = gv('p2-cat-bar');
  if (catBar) {
    catBar.innerHTML = cats.map(c => `
      <button class="cat-btn${c === cardCategory ? ' active' : ''}" data-cat="${c}" onclick="setCardCategory('${c}')">
        ${c === 'All' ? '🌿 All' : c}
      </button>`).join('');
  }

  if (!filtered.length) {
    gv('p2-cards').innerHTML = `<div class="no-cards">No active plants. Toggle some on in "Your Plants".</div>`;
    return;
  }

  gv('p2-cards').innerHTML = filtered.map((r, i) => {
    const linkedFerts = getFertNamesFor(r);
    const linkedSoils = getSoilNamesFor(r);
    const hasDetails = getCa(r) || getMg(r) || getOther(r) || getTips(r) || linkedFerts.length || linkedSoils.length;
    return `
    <div class="plant-card" id="card-${i}">
      <div class="card-head">
        <div class="card-plant-name">${r['Plant']}</div>
        <div class="card-meta">
          <span class="card-tag"><i class="ti ti-dna" style="font-size:11px"></i>${r['Genus']}</span>
          <span class="stage-badge ${stageBadgeClass(r['Growth Stage'])}">${r['Growth Stage'].replace(/\n/g,' ')}</span>
          ${r['Winter Hardy'] ? `<span class="card-tag" title="Winter Hardy">❄️ ${esc(r['Winter Hardy'])}</span>` : ''}
          ${r['Propagation']  ? `<span class="card-tag" title="Propagation">🌱 ${esc(r['Propagation'])}</span>`  : ''}
        </div>
      </div>
      <div class="card-body">
        <div class="npk-row">
          <div class="npk-box n"><div class="lbl">N</div><div class="val">${getN(r)}</div></div>
          <div class="npk-box p"><div class="lbl">P</div><div class="val">${getP(r)}</div></div>
          <div class="npk-box k"><div class="lbl">K</div><div class="val">${getK(r)}</div></div>
        </div>
        <div class="npk-row">
          <div class="npk-box n"><div class="lbl">N mg/L</div><div class="val" style="font-size:11px">${getNmgl(r)}</div></div>
          <div class="npk-box p"><div class="lbl">P mg/L</div><div class="val" style="font-size:11px">${getPmgl(r)}</div></div>
          <div class="npk-box k"><div class="lbl">K mg/L</div><div class="val" style="font-size:11px">${getKmgl(r)}</div></div>
        </div>
        ${linkedSoils.length ? `
        <div class="fert-tags">
          ${linkedSoils.map(f => `<span class="soil-tag">🪴 ${esc(f['Name'])}</span>`).join('')}
        </div>` : ''}
        ${linkedFerts.length ? `
        <div class="fert-tags">
          ${linkedFerts.map(f => `<span class="fert-tag"><i class="ti ti-flask" style="font-size:11px"></i>${esc(f['Name'])}</span>`).join('')}
        </div>` : ''}
        ${hasDetails ? `
        <button class="card-expand-btn" onclick="toggleCardDetails(document.getElementById('card-${i}'))">
          <span class="card-expand-label-show"><i class="ti ti-chevron-down"></i> Show details</span>
          <span class="card-expand-label-hide"><i class="ti ti-chevron-up"></i> Hide details</span>
        </button>
        <div class="card-details">
          ${getCa(r)    ? `<div class="card-divider"></div><div><div class="card-section-label">Calcium (Ca)</div><div class="card-section-text">${esc(getCa(r))}</div></div>` : ''}
          ${getMg(r)    ? `<div><div class="card-section-label">Magnesium (Mg)</div><div class="card-section-text">${esc(getMg(r))}</div></div>` : ''}
          ${getOther(r) ? `<div><div class="card-section-label">Other Nutrients</div><div class="card-section-text">${esc(getOther(r))}</div></div>` : ''}
          ${getTips(r)  ? `<div class="card-divider"></div><div><div class="card-section-label" style="color:var(--accent)">Fertilizer Tips</div><div class="card-section-text">${esc(getTips(r))}</div></div>` : ''}
          ${linkedSoils.length ? `<div class="card-divider"></div><div><div class="card-section-label" style="color:var(--warn)">Linked Soils</div>
            ${linkedSoils.map(f => `
              <div class="linked-fert-detail">
                <div class="linked-fert-name">🪴 ${esc(f['Name'])}</div>
                ${f['pH'] ? `<div class="linked-fert-npk">pH ${esc(f['pH'])}</div>` : ''}
                ${f['Other'] ? `<div class="linked-fert-other">${esc(f['Other'])}</div>` : ''}
                ${f['Notes'] ? `<div class="linked-fert-notes">${esc(f['Notes'])}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
          ${linkedFerts.length ? `<div class="card-divider"></div><div><div class="card-section-label" style="color:var(--accent)">Linked Fertilizers</div>
            ${linkedFerts.map(f => `
              <div class="linked-fert-detail">
                <div class="linked-fert-name">${esc(f['Name'])}</div>
                <div class="linked-fert-npk">N ${esc(f['N']||'—')} · P ${esc(f['P']||'—')} · K ${esc(f['K']||'—')} · Cal ${esc(f['Cal']||'—')} · Mag ${esc(f['Mag']||'—')} · S ${esc(f['Sulfur']||'—')}</div>
                ${f['Other'] ? `<div class="linked-fert-other">${esc(f['Other'])}</div>` : ''}
                ${f['Notes'] ? `<div class="linked-fert-notes">${esc(f['Notes'])}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 3 — Editor
// ═══════════════════════════════════════════════════════════════════════════════
function renderEditor() {
  const search = (gv('p3-search')?.value||'').toLowerCase();
  const rows   = data.filter(r => !search||r['Plant'].toLowerCase().includes(search)||(r['Genus']||'').toLowerCase().includes(search));
  gv('p3-count').textContent = `(${data.length} total)`;
  // Desktop table
  gv('p3-tbody').innerHTML = rows.map(r => {
    const idx = data.indexOf(r);
    const fertCount = (r['_fertIds']||[]).length;
    const soilCount = (r['_soilIds']||[]).length;
    return `<tr>
      <td><strong>${r['Plant']}</strong></td>
      <td style="color:var(--text2);font-size:12px">${r['Genus']}</td>
      <td><span class="stage-badge ${stageBadgeClass(r['Growth Stage'])}">${r['Growth Stage'].replace(/\n/g,' ')}</span></td>
      <td class="npk-pill">${getN(r)}:${getP(r)}:${getK(r)}</td>
      <td><div class="row-actions">
        <button class="btn sm" onclick="openSoilLinkModal(${idx})" title="Link soils" style="${soilCount?'color:var(--warn)':''}">🪴${soilCount?` ${soilCount}`:''}</button>
        <button class="btn sm" onclick="openLinkModal(${idx})" title="Link fertilizers"><i class="ti ti-flask"></i>${fertCount?` ${fertCount}`:''}</button>
        <button class="btn sm" onclick="openModal(${idx})"><i class="ti ti-edit"></i></button>
        <button class="btn sm danger" onclick="deleteRow(${idx})"><i class="ti ti-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
  // Mobile cards
  if (gv('p3-cards')) {
    gv('p3-cards').innerHTML = rows.map(r => {
      const idx = data.indexOf(r);
      const fertCount = (r['_fertIds']||[]).length;
      const soilCount = (r['_soilIds']||[]).length;
      return `
        <div class="editor-card">
          <div class="editor-card-info">
            <div class="editor-card-name">${r['Plant']}</div>
            <div class="editor-card-meta">
              <span class="stage-badge ${stageBadgeClass(r['Growth Stage'])}">${r['Growth Stage'].replace(/\n/g,' ')}</span>
              <span class="npk-pill">${getN(r)}:${getP(r)}:${getK(r)}</span>
            </div>
          </div>
          <div class="editor-card-actions">
            <button class="btn sm" onclick="openSoilLinkModal(${idx})" title="Link soils" style="${soilCount?'color:var(--warn)':''}">🪴${soilCount?` ${soilCount}`:''}</button>
            <button class="btn sm" onclick="openLinkModal(${idx})" title="Link fertilizers"><i class="ti ti-flask"></i>${fertCount?` ${fertCount}`:''}</button>
            <button class="btn sm" onclick="openModal(${idx})"><i class="ti ti-edit"></i></button>
            <button class="btn sm danger" onclick="deleteRow(${idx})"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    }).join('');
  }
}

// ── Modal ──────────────────────────────────────────────────────────────────────
let editIdx = null;
function openModal(idx) {
  editIdx = idx;
  gv('modal-title').textContent = idx===null ? 'Add plant' : 'Edit plant';
  const r = idx!==null ? data[idx] : {};
  gv('f-plant').value   = r['Plant']||'';
  gv('f-genus').value   = r['Genus']||'';
  gv('f-stage').value   = (r['Growth Stage']||'').replace(/\n/g,' ');
  gv('f-winter-hardy').value = r['Winter Hardy']||'';
  gv('f-propagation').value  = r['Propagation']||'';
  gv('f-n-ratio').value = getN(r);
  gv('f-p-ratio').value = getP(r);
  gv('f-k-ratio').value = getK(r);
  gv('f-n-mgl').value   = getNmgl(r);
  gv('f-p-mgl').value   = getPmgl(r);
  gv('f-k-mgl').value   = getKmgl(r);
  gv('f-ca').value      = getCa(r);
  gv('f-mg').value      = getMg(r);
  gv('f-other').value   = getOther(r);
  gv('f-tips').value    = getTips(r);
  gv('modal-overlay').classList.add('open');
  gv('f-plant').focus();
}
function closeModal()         { gv('modal-overlay').classList.remove('open'); editIdx = null; }
function closeModalOutside(e) { if (e.target===gv('modal-overlay')) closeModal(); }

async function saveEntry() {
  const entry = {
    'Plant':          gv('f-plant').value.trim(),
    'Genus':          gv('f-genus').value.trim(),
    'Growth Stage':   gv('f-stage').value.trim(),
    'Winter Hardy':   gv('f-winter-hardy').value,
    'Propagation':    gv('f-propagation').value,
    'N\n(ratio)':   gv('f-n-ratio').value.trim(),
    'P\n(ratio)':   gv('f-p-ratio').value.trim(),
    'K\n(ratio)':   gv('f-k-ratio').value.trim(),
    'N\n(mg/L)':    gv('f-n-mgl').value.trim(),
    'P\n(mg/L)':    gv('f-p-mgl').value.trim(),
    'K\n(mg/L)':    gv('f-k-mgl').value.trim(),
    'Calcium (Ca)':  gv('f-ca').value.trim(),
    'Magnesium (Mg)':gv('f-mg').value.trim(),
    'Other Nutrients':gv('f-other').value.trim(),
    'Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)': gv('f-tips').value.trim(),
  };
  if (!entry['Plant']) { showToast('Plant name is required.'); return; }
  try {
    if (editIdx !== null) {
      const existing = data[editIdx];
      await savePlantDoc(existing._docId, { ...existing, ...entry });
      showToast('Plant updated.');
    } else {
      await addPlantDoc(entry);
      if (!plantPrefs[entry['Plant']]) {
        plantPrefs[entry['Plant']] = { on: true, stage: entry['Growth Stage'] };
        savePrefs();
      }
      showToast('Plant added.');
    }
    closeModal();
  } catch(e) { showToast('Error saving: ' + e.message); }
}

async function deleteRow(idx) {
  const row = data[idx];
  if (!confirm(`Delete "${row['Plant']}" (${row['Growth Stage'].replace(/\n/g,' ')})?`)) return;
  try {
    await deletePlantDoc(row._docId);
    showToast('Entry deleted.');
  } catch(e) { showToast('Error deleting: ' + e.message); }
}

async function resetToDefault() {
  if (!confirm('Reset ALL plant data in this garden to the original defaults? This cannot be undone.')) return;
  try {
    // Delete all existing
    const snap  = await db.collection('gardens').doc(currentGarden.id).collection('plants').get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    // Re-seed
    const batch2 = db.batch();
    DEFAULT_DATA.forEach((row, i) => {
      const ref = db.collection('gardens').doc(currentGarden.id).collection('plants').doc(`plant_${i}`);
      batch2.set(ref, { ...row, _order: i });
    });
    await batch2.commit();
    plantPrefs = {};
    savePrefs();
    showToast('Data reset to original.');
  } catch(e) { showToast('Error: ' + e.message); }
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plant_nutrient_guide.json';
  a.click();
}

function importData() {
  gv('import-json-input').value = '';
  gv('import-json-input').click();
}

async function handleImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  let parsed;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch (e) {
    showToast('❌ Invalid JSON file.'); return;
  }
  if (!Array.isArray(parsed) || !parsed.length) {
    showToast('❌ JSON must be a non-empty array.'); return;
  }
  if (!parsed[0]['Plant']) {
    showToast('❌ Rows must have a "Plant" field.'); return;
  }
  if (!confirm(`Import ${parsed.length} rows? This will replace all current plant data.`)) return;
  try {
    // Delete all existing plant docs
    const col = db.collection('gardens').doc(currentGarden.id).collection('data');
    const existing = await col.get();
    const delBatch = db.batch();
    existing.docs.forEach(d => delBatch.delete(d.ref));
    await delBatch.commit();
    // Write imported rows in batches of 500
    const chunks = [];
    for (let i = 0; i < parsed.length; i += 500) chunks.push(parsed.slice(i, i + 500));
    for (const chunk of chunks) {
      const batch = db.batch();
      chunk.forEach(row => {
        const { _docId, ...clean } = row; // strip internal id if present
        batch.set(col.doc(), clean);
      });
      await batch.commit();
    }
    showToast(`✅ Imported ${parsed.length} rows.`);
  } catch (e) {
    showToast('❌ Import failed: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 4 — Fertilizers
// ═══════════════════════════════════════════════════════════════════════════════
function renderFertilizers() {
  const search = (gv('p4-search')?.value||'').toLowerCase();
  const rows   = fertilizers.filter(f => !search || (f['Name']||'').toLowerCase().includes(search));
  gv('p4f-count').textContent = `(${fertilizers.length} total)`;

  const npkCell = f => `<span class="npk-pill">${f['N']||'—'}:${f['P']||'—'}:${f['K']||'—'}</span>`;

  const typeLabel = f => {
    const t = f['Type']||'';
    if (t === 'Soil') return `<span style="font-size:11px;background:var(--warn-bg);color:var(--warn);border-radius:20px;padding:2px 7px;font-weight:500">🪴 Soil</span>`;
    if (t === 'Solid Fertilizer') return `<span style="font-size:11px;background:var(--accent-bg);color:var(--accent-text);border-radius:20px;padding:2px 7px;font-weight:500">🧱 Solid</span>`;
    if (t === 'Liquid Fertilizer') return `<span style="font-size:11px;background:var(--accent-bg);color:var(--accent-text);border-radius:20px;padding:2px 7px;font-weight:500">💧 Liquid</span>`;
    return `<span style="font-size:11px;color:var(--text3)">${esc(t||'—')}</span>`;
  };

  // Desktop table
  if (gv('p4f-tbody')) {
    gv('p4f-tbody').innerHTML = rows.map(f => {
      const idx = fertilizers.indexOf(f);
      const isSoil = f['Type'] === 'Soil';
      return `<tr>
        <td><strong>${esc(f['Name'])}</strong></td>
        <td>${typeLabel(f)}</td>
        <td class="npk-pill">${isSoil ? '<span style="color:var(--text3);font-size:12px">—</span>' : npkCell(f)}</td>
        <td style="font-size:12px">${isSoil ? (f['pH'] ? `pH ${esc(f['pH'])}` : '—') : esc(f['Cal']||'—')}</td>
        <td style="font-size:12px">${isSoil ? '—' : esc(f['Mag']||'—')}</td>
        <td style="font-size:12px">${isSoil ? '—' : esc(f['Sulfur']||'—')}</td>
        <td style="font-size:12px;color:var(--text2)">${esc(f['Other']||'—')}</td>
        <td><div class="row-actions">
          <button class="btn sm" onclick="openFertModal(${idx})"><i class="ti ti-edit"></i></button>
          <button class="btn sm danger" onclick="deleteFertRow(${idx})"><i class="ti ti-trash"></i></button>
        </div></td>
      </tr>`;
    }).join('');
  }
  // Mobile cards
  if (gv('p4f-cards')) {
    gv('p4f-cards').innerHTML = rows.map(f => {
      const idx = fertilizers.indexOf(f);
      const isSoil = f['Type'] === 'Soil';
      return `
        <div class="editor-card">
          <div class="editor-card-info">
            <div class="editor-card-name">${esc(f['Name'])}</div>
            <div class="editor-card-meta">
              ${typeLabel(f)}
              ${!isSoil ? `<span class="npk-pill">${npkCell(f)}</span>` : ''}
              ${isSoil && f['pH'] ? `<span class="editor-card-soil">pH ${esc(f['pH'])}</span>` : ''}
              ${!isSoil && f['Cal'] ? `<span class="editor-card-soil">Cal ${esc(f['Cal'])}</span>` : ''}
              ${!isSoil && f['Mag'] ? `<span class="editor-card-soil">Mag ${esc(f['Mag'])}</span>` : ''}
            </div>
          </div>
          <div class="editor-card-actions">
            <button class="btn sm" onclick="openFertModal(${idx})"><i class="ti ti-edit"></i></button>
            <button class="btn sm danger" onclick="deleteFertRow(${idx})"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    }).join('');
  }
  if (!rows.length) {
    if (gv('p4f-tbody')) gv('p4f-tbody').innerHTML = `<tr class="empty-row"><td colspan="8">No items yet. Add one to get started.</td></tr>`;
    if (gv('p4f-cards')) gv('p4f-cards').innerHTML = search ? `<div class="no-cards">No items match your search.</div>` : `<div class="no-cards">No items yet. Add one to get started.</div>`;
  }
}

// ── Fertilizer modal ──────────────────────────────────────────────────────────
function onFertTypeChange() {
  const isSoil = gv('ff-type').value === 'Soil';
  gv('ff-ph-group').style.display = isSoil ? '' : 'none';
}

let editFertIdx = null;
function openFertModal(idx) {
  editFertIdx = idx;
  gv('fert-modal-title').textContent = idx===null ? 'Add item' : 'Edit item';
  const f = idx!==null ? fertilizers[idx] : {};
  gv('ff-name').value   = f['Name']  || '';
  gv('ff-type').value   = f['Type']  || 'Liquid Fertilizer';
  gv('ff-ph').value     = f['pH']    || '';
  gv('ff-n').value      = f['N']     || '';
  gv('ff-p').value      = f['P']     || '';
  gv('ff-k').value      = f['K']     || '';
  gv('ff-cal').value    = f['Cal']   || '';
  gv('ff-mag').value    = f['Mag']   || '';
  gv('ff-sulfur').value = f['Sulfur']|| '';
  gv('ff-other').value  = f['Other'] || '';
  gv('ff-notes').value  = f['Notes'] || '';
  onFertTypeChange();
  gv('fert-modal-overlay').classList.add('open');
  gv('ff-name').focus();
}
function closeFertModal()         { gv('fert-modal-overlay').classList.remove('open'); editFertIdx = null; }
function closeFertModalOutside(e) { if (e.target===gv('fert-modal-overlay')) closeFertModal(); }

async function saveFertEntry() {
  const entry = {
    'Name':   gv('ff-name').value.trim(),
    'Type':   gv('ff-type').value,
    'pH':     gv('ff-ph').value.trim(),
    'N':      gv('ff-n').value.trim(),
    'P':      gv('ff-p').value.trim(),
    'K':      gv('ff-k').value.trim(),
    'Cal':    gv('ff-cal').value.trim(),
    'Mag':    gv('ff-mag').value.trim(),
    'Sulfur': gv('ff-sulfur').value.trim(),
    'Other':  gv('ff-other').value.trim(),
    'Notes':  gv('ff-notes').value.trim(),
  };
  if (!entry['Name']) { showToast('Fertilizer name is required.'); return; }
  try {
    if (editFertIdx !== null) {
      const existing = fertilizers[editFertIdx];
      await saveFertDoc(existing._docId, { ...existing, ...entry });
      showToast('Fertilizer updated.');
    } else {
      await addFertDoc(entry);
      showToast('Fertilizer added.');
    }
    closeFertModal();
  } catch(e) { showToast('Error saving: ' + e.message); }
}

async function deleteFertRow(idx) {
  const f = fertilizers[idx];
  if (!confirm(`Delete fertilizer "${f['Name']}"? It will be unlinked from any growth stages using it.`)) return;
  try {
    await deleteFertDoc(f._docId);
    showToast('Fertilizer deleted.');
  } catch(e) { showToast('Error deleting: ' + e.message); }
}

// ── Linking fertilizers to a Plant + Growth Stage row ────────────────────────────
// Opens a small picker letting the user choose which fertilizers apply to the
// row's specific growth stage.
let linkRowIdx = null;
function openLinkModal(idx) {
  linkRowIdx = idx;
  const row = data[idx];
  gv('link-modal-subtitle').textContent = `${row['Plant']} — ${(row['Growth Stage']||'').replace(/\n/g,' ')}`;
  const selectedIds = new Set(row['_fertIds']||[]);
  const ferts = fertilizers.filter(f => f['Type'] !== 'Soil');
  if (!ferts.length) {
    gv('link-modal-list').innerHTML = `<div class="no-cards" style="padding:1.5rem">No fertilizers yet. Add some in the Soil & Fert. tab first.</div>`;
  } else {
    gv('link-modal-list').innerHTML = ferts.map(f => {
      const typeIcon = f['Type'] === 'Solid Fertilizer' ? '🧱' : '💧';
      return `
      <label class="link-fert-row">
        <input type="checkbox" value="${f._docId}" ${selectedIds.has(f._docId)?'checked':''}>
        <div class="link-fert-info">
          <div class="link-fert-name">${typeIcon} ${esc(f['Name'])}</div>
          <div class="link-fert-npk">N ${esc(f['N']||'—')} · P ${esc(f['P']||'—')} · K ${esc(f['K']||'—')}</div>
        </div>
      </label>`;
    }).join('');
  }
  gv('link-modal-overlay').classList.add('open');
}
function closeLinkModal()         { gv('link-modal-overlay').classList.remove('open'); linkRowIdx = null; }
function closeLinkModalOutside(e) { if (e.target===gv('link-modal-overlay')) closeLinkModal(); }

async function saveLinkedFerts() {
  if (linkRowIdx === null) return;
  const checked = Array.from(gv('link-modal-list').querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  const row = data[linkRowIdx];
  try {
    await savePlantDoc(row._docId, { ...row, _fertIds: checked });
    showToast('Fertilizers linked.');
    closeLinkModal();
  } catch(e) { showToast('Error linking: ' + e.message); }
}

// ── Linking soils to a Plant + Growth Stage row ────────────────────────────────
let soilLinkRowIdx = null;
function openSoilLinkModal(idx) {
  soilLinkRowIdx = idx;
  const row = data[idx];
  gv('soil-link-modal-subtitle').textContent = `${row['Plant']} — ${(row['Growth Stage']||'').replace(/\n/g,' ')}`;
  const selectedIds = new Set(row['_soilIds']||[]);
  const soils = fertilizers.filter(f => f['Type'] === 'Soil');
  if (!soils.length) {
    gv('soil-link-modal-list').innerHTML = `<div class="no-cards" style="padding:1.5rem">No soils yet. Add some in the Soil & Fert. tab first.</div>`;
  } else {
    gv('soil-link-modal-list').innerHTML = soils.map(f => `
      <label class="link-fert-row">
        <input type="checkbox" value="${f._docId}" ${selectedIds.has(f._docId)?'checked':''}>
        <div class="link-fert-info">
          <div class="link-fert-name">🪴 ${esc(f['Name'])}</div>
          <div class="link-fert-npk">${f['pH'] ? `pH ${esc(f['pH'])}` : ''}${f['Other'] ? (f['pH']?' · ':'')+esc(f['Other']) : ''}</div>
        </div>
      </label>`).join('');
  }
  gv('soil-link-modal-overlay').classList.add('open');
}
function closeSoilLinkModal()         { gv('soil-link-modal-overlay').classList.remove('open'); soilLinkRowIdx = null; }
function closeSoilLinkModalOutside(e) { if (e.target===gv('soil-link-modal-overlay')) closeSoilLinkModal(); }

async function saveLinkedSoils() {
  if (soilLinkRowIdx === null) return;
  const checked = Array.from(gv('soil-link-modal-list').querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  const row = data[soilLinkRowIdx];
  try {
    await savePlantDoc(row._docId, { ...row, _soilIds: checked });
    showToast('Soils linked.');
    closeSoilLinkModal();
  } catch(e) { showToast('Error linking: ' + e.message); }
}

function getSoilNamesFor(row) {
  const ids = row && row['_soilIds'] ? row['_soilIds'] : [];
  return ids.map(id => getFertById(id)).filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 5 — Members
// ═══════════════════════════════════════════════════════════════════════════════
function renderMembers() {
  if (!currentGarden) return;
  const members = currentGarden.members || {};
  const isOwner = currentGarden.ownerId === currentUser.uid;

  gv('members-list').innerHTML = Object.entries(members).map(([uid, m]) => {
    const initial = (m.displayName||m.email||'?')[0].toUpperCase();
    const isGardenOwner = uid === currentGarden.ownerId;
    const canRemove = isOwner && uid !== currentUser.uid;
    return `
      <div class="member-row">
        <div class="member-avatar">${initial}</div>
        <div class="member-info">
          <div class="member-name">${esc(m.displayName||m.email)}</div>
          <div class="member-email">${esc(m.email)}${uid===currentUser.uid?' (you)':''}</div>
        </div>
        <span class="member-role-badge ${isGardenOwner?'owner':''}">${isGardenOwner?'Owner':'Member'}</span>
        ${canRemove ? `<button class="btn sm danger" onclick="removeMember('${uid}','${esc(m.displayName||m.email)}')"><i class="ti ti-x"></i></button>` : ''}
      </div>`;
  }).join('');

  // Invite code
  gv('invite-code-display').textContent = currentGarden.inviteCode || '—';

  // Owner-only: leave/delete garden
  gv('owner-only-section').innerHTML = isOwner
    ? `<div class="danger-zone">
        <h3>Danger zone</h3>
        <p>Permanently delete this garden and all its plant data. This cannot be undone.</p>
        <button class="btn danger" onclick="deleteGarden()"><i class="ti ti-trash"></i> Delete garden</button>
       </div>`
    : `<button class="btn danger" onclick="leaveGarden()"><i class="ti ti-door-exit"></i> Leave garden</button>`;
}

async function inviteMember() {
  const email = gv('invite-email').value.trim().toLowerCase();
  if (!email) { showToast('Enter an email address.'); return; }
  // Look up user by email
  const snap = await db.collection('users').where('email','==',email).limit(1).get();
  if (snap.empty) {
    showToast('No account found for that email. Ask them to sign up first.');
    return;
  }
  const invitedUid = snap.docs[0].id;
  const invitedData = snap.docs[0].data();
  if ((currentGarden.memberIds||[]).includes(invitedUid)) {
    showToast('That person is already in this garden.'); return;
  }
  try {
    await db.collection('gardens').doc(currentGarden.id).update({
      memberIds: firebase.firestore.FieldValue.arrayUnion(invitedUid),
      [`members.${invitedUid}`]: { email: invitedData.email, displayName: invitedData.displayName||invitedData.email, role: 'member' }
    });
    gv('invite-email').value = '';
    showToast(`${invitedData.displayName||email} added to the garden!`);
  } catch(e) { showToast('Error: ' + e.message); }
}

async function removeMember(uid, name) {
  if (!confirm(`Remove ${name} from the garden?`)) return;
  try {
    const update = {
      memberIds: firebase.firestore.FieldValue.arrayRemove(uid),
      [`members.${uid}`]: firebase.firestore.FieldValue.delete()
    };
    await db.collection('gardens').doc(currentGarden.id).update(update);
    // Also remove their prefs
    await db.collection('gardens').doc(currentGarden.id).collection('prefs').doc(uid).delete();
    showToast(`${name} removed.`);
  } catch(e) { showToast('Error: ' + e.message); }
}

function copyInviteCode() {
  const code = currentGarden.inviteCode||'';
  navigator.clipboard.writeText(code).then(() => showToast('Invite code copied!')).catch(() => showToast(code));
}

async function leaveGarden() {
  if (!confirm('Leave this garden? You can rejoin with the invite code.')) return;
  try {
    await db.collection('gardens').doc(currentGarden.id).update({
      memberIds: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
      [`members.${currentUser.uid}`]: firebase.firestore.FieldValue.delete()
    });
    showGardenScreen();
  } catch(e) { showToast('Error: ' + e.message); }
}

async function deleteGarden() {
  if (!confirm('Delete this entire garden and all its data? This CANNOT be undone.')) return;
  try {
    // Delete sub-collections
    const plants = await db.collection('gardens').doc(currentGarden.id).collection('plants').get();
    const prefs  = await db.collection('gardens').doc(currentGarden.id).collection('prefs').get();
    const batch  = db.batch();
    plants.docs.forEach(d => batch.delete(d.ref));
    prefs.docs.forEach(d  => batch.delete(d.ref));
    batch.delete(db.collection('gardens').doc(currentGarden.id));
    await batch.commit();
    showToast('Garden deleted.');
    showGardenScreen();
  } catch(e) { showToast('Error: ' + e.message); }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NAV + RENDER
// ═══════════════════════════════════════════════════════════════════════════════
function switchTab(idx) {
  document.querySelectorAll('.page').forEach((p,i)     => p.classList.toggle('active', i===idx));
  document.querySelectorAll('.nav-tab').forEach((t,i)  => t.classList.toggle('active', i===idx));
  document.querySelectorAll('.bottom-tab').forEach((t,i)=> t.classList.toggle('active', i===idx));
  if (idx === 4) renderMembers();
}

function renderAll() {
  renderPlantDashboard();
  renderCards();
  renderEditor();
  renderFertilizers();
}

function showToast(msg) {
  const t = gv('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DEFAULT DATA (seed for new gardens)
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_DATA = [{"Plant":"🍅 Tomato","Genus":"San Marzano","Growth Stage":"Seedling\n(weeks 1–3)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–80 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"High – 150–200 ppm\nPrevents blossom-end rot later. Start Cal early.","Magnesium (Mg)":"Moderate – 40–60 ppm\nRequired for chlorophyll from day 1.","Other Nutrients":"Iron (Fe): 2–3 ppm – prevents yellowing between veins\nSulfur (S): 50 ppm – enzyme activity\nBoron (B): 0.5 ppm – cell division","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Use HIGH-N fert at low dose (½ strength). Add Canna CalMag every watering."},{"Plant":"🍅 Tomato","Genus":"San Marzano","Growth Stage":"Vegetative\n(weeks 4–7)","N\n(ratio)":"4","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"150–250 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"200–300 mg/L","Calcium (Ca)":"High – 180–220 ppm\nKeep Ca elevated throughout to protect fruit cells.","Magnesium (Mg)":"Moderate – 50–70 ppm\nEpsom salt weekly if leaves pale between veins.","Other Nutrients":"Manganese (Mn): 1–2 ppm\nZinc (Zn): 0.5 ppm – enzyme function\nCopper (Cu): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. Add HIGH-K fert at ½ dose. Canna CalMag every watering."},{"Plant":"🍅 Tomato","Genus":"San Marzano","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"300–400 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nCritical — low Ca = blossom-end rot (black bottom on tomatoes).","Magnesium (Mg)":"Moderate – 50–60 ppm\nMaintain steady Mg — deficiency shows as yellowing leaves.","Other Nutrients":"Boron (B): 0.5–1 ppm – essential for pollen & fruit set\nSilica (Si): 50–100 ppm – strengthens cell walls","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Keep HIGH-N very low. Canna CalMag every watering."},{"Plant":"🥔 Potato","Genus":"Unknown","Growth Stage":"Vegetative\n(weeks 1–6)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"Moderate – 120–160 ppm\nLess critical than tomatoes but still needed.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Sulfur (S): 50–70 ppm – improves flavour\nIron (Fe): 2 ppm\nMolybdenum (Mo): trace – nitrogen metabolism","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. Mix in HIGH-K fert from week 3. CalMag at half dose."},{"Plant":"🥔 Potato","Genus":"Unknown","Growth Stage":"Tuber Bulking\n(weeks 7–12)","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"7","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"300–400 mg/L","Calcium (Ca)":"Moderate – 120–150 ppm","Magnesium (Mg)":"Moderate – 50 ppm\nMg supports starch synthesis in tubers.","Other Nutrients":"Sulfur (S): 60–80 ppm – most important micronutrient for potato quality\nZinc (Zn): 1 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Cut HIGH-N fert to ¼ dose or stop. Go heavy on HIGH-K fert. Continue CalMag."},{"Plant":"🍋 Lemon","Genus":"Lemon Citrus","Growth Stage":"Year-round\n(Maintenance)","N\n(ratio)":"4.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"30–50 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"High – 160–200 ppm\nCitrus is prone to Ca deficiency — fruit splitting and tip die-back.","Magnesium (Mg)":"High – 60–80 ppm\nMagnesium is critical for lemons — deficiency = yellowing old leaves. Most common problem.","Other Nutrients":"Iron (Fe): 3–5 ppm – citrus very prone to iron chlorosis\nManganese (Mn): 2–3 ppm\nZinc (Zn): 1–2 ppm – fruit size & set\nBoron (B): 0.5 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert as base. Add HIGH-K fert at ½ dose. Canna CalMag at full dose every watering — lemons demand it."},{"Plant":"🍋 Lemon","Genus":"Lemon Citrus","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"250–350 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nPrevents fruit splitting during rapid growth.","Magnesium (Mg)":"High – 70–90 ppm\nMg deficiency peaks during fruiting — watch for yellow leaves.","Other Nutrients":"Boron (B): 0.5–1 ppm – very important for citrus fruit set\nCopper (Cu): 0.5 ppm\nSilica: helps rinds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert. Add CalMag at full dose. Consider Epsom salt spray on leaves for Mg."},{"Plant":"🌶️ Red Chili","Genus":"Unknown","Growth Stage":"Vegetative\n(weeks 1–5)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"Moderate – 130–160 ppm\nBlossom-end rot possible in peppers too — keep Ca up.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm\nZinc (Zn): 0.5–1 ppm – affects capsaicin production\nBoron (B): 0.3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. CalMag every watering."},{"Plant":"🌶️ Red Chili","Genus":"Unknown","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"280–380 mg/L","Calcium (Ca)":"High – 160–200 ppm\nBlossom-end rot is common in peppers — maintain Ca.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Zinc (Zn): 1–2 ppm – boosts capsaicin levels\nBoron (B): 0.5 ppm – fruit set\nSulfur (S): 50 ppm – flavour compounds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Minimal HIGH-N. CalMag every watering."},{"Plant":"🌿 Mint","Genus":"Unknown","Growth Stage":"Year-round\n(Herb)","N\n(ratio)":"3.5","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"20–40 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"Moderate – 100–140 ppm","Magnesium (Mg)":"Moderate – 30–50 ppm","Other Nutrients":"Iron (Fe): 1–2 ppm\nMagnesium (Mg): important for leaf colour\nSulfur (S): 30–40 ppm — menthol synthesis","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Bio Grow ¼–½ dose (1–2ml/L). Lemon fert 1ml/L for K+S."},{"Plant":"🍓 Strawberry","Genus":"Frageria","Growth Stage":"Vegetative /\nRunner Stage","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"High – 150–200 ppm\nPrevents tip burn on leaves — a common Ca deficiency symptom.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm – strawberries are prone to chlorosis\nBoron (B): 0.3–0.5 ppm\nMolybdenum (Mo): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N at moderate dose. CalMag at full dose. Add HIGH-K at ¼ dose."},{"Plant":"🍓 Strawberry","Genus":"Frageria","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"280–350 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nTip burn and poor fruit texture without Ca. Common problem.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 0.5–1 ppm – key for fruit set and seed development\nSilica: 50 ppm – stronger plant","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Drop HIGH-N to trace. Full CalMag every watering."}];
