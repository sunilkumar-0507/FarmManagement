/* ========================================
   FARM MANAGEMENT SYSTEM - MAIN JAVASCRIPT
   ======================================== */

'use strict';

/* ─── LocalStorage Keys ─── */
const KEYS = {
  users:    'fms_users',
  session:  'fms_session',
  expenses: 'fms_expenses',
  incomes:  'fms_incomes',
};

/* ─── Categories from your spreadsheet ─── */
const EXPENSE_CATEGORIES = [
  'Monthly Salary',
  'Daily Wages/Labour',
  'Electricity Bill',
  'Appreciation Payment to Sermaraj',
  'Additional Items Purchases',
  'Sapling Purchase (மரக்கன்று கொள்முதல்)',
  'Manure Purchase (எரு/ உரம் கொள்முதல்)',
  'Ploughing Expenses (உழவுச் செலவுகள்)',
  'Transport for Labour',
  'Salary For Guardian',
  'Expense - Jasmine (மல்லிகை செலவுகள்)',
  'General Topup',
];

const INCOME_SOURCES = [
  'Income from Jasmine (மல்லிகை வருமானம்)',
  'Profit from Jasmine (மல்லிகை)',
  'Receipt of monthly payment - Ruban',
  'Receipt of monthly payment - Siva',
  'Receipt of monthly payment - Rajavel',
];

/* ─── Default Seed Data ─── */
// Data now comes from the database via API endpoints
// No hardcoded seed data needed



/* ─── Storage Helpers ─── */
const store = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  init() {
    // Data now comes from API. Only store session info in localStorage
  }
};

/* ─── Auth Helpers ─── */
const auth = {
  getSession: ()        => store.get(KEYS.session),
  setSession: (user)    => store.set(KEYS.session, user),
  clearSession: ()      => localStorage.removeItem(KEYS.session),
  isLoggedIn: ()        => !!store.get(KEYS.session),
  currentUser: ()       => store.get(KEYS.session),
  isAdmin: ()           => ['Admin','FarmOwner'].includes(auth.currentUser()?.role),
};

/* ─── ID Generator ─── */
const genId = (prefix) => prefix + Date.now() + Math.random().toString(36).slice(2,6);

/* ─── Format Helpers ─── */
const fmt = {
  currency: (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
  date:     (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  dateInput:(d) => d, // already YYYY-MM-DD
};

/* ─── Toast Notification ─── */
function showToast(message, type = 'success') {
  const existing = document.getElementById('toast-container');
  if (existing) existing.remove();

  const c = document.createElement('div');
  c.id = 'toast-container';
  c.style.cssText = `
    position: fixed; top: 80px; right: 24px; z-index: 9999;
    animation: slideInRight .3s ease;
  `;

  const icon = type === 'success' ? '✅' : '❌';
  const bg   = type === 'success' ? '#166534' : '#991b1b';

  c.innerHTML = `
    <div style="
      background:${bg}; color:white; padding:14px 20px;
      border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,.25);
      display:flex; align-items:center; gap:10px;
      font-size:14px; font-weight:600; max-width:320px;
    ">
      <span>${icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(c);
  setTimeout(() => c.remove(), 3500);
}

/* ─── Navbar Builder ─── */
function buildNavbar(activePage) {
  const user = auth.currentUser();
  if (!user) return '';

  const initials = user.fullName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const pages = [
    { id: 'dashboard', label: '📊 Dashboard', href: 'dashboard.html' },
    { id: 'income',    label: '📈 Income',    href: 'income.html'    },
    { id: 'expenses',  label: '📉 Expenses',  href: 'expenses.html'  },
  ];

  const navLinks = pages.map(p => `
    <li class="nav-item">
      <a href="${p.href}" class="${activePage === p.id ? 'active' : ''}">${p.label}</a>
    </li>
  `).join('');

  return `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">🌿</span>
        <span>FarmMS</span>
      </div>
      <ul class="navbar-nav">${navLinks}</ul>
      <div class="navbar-right">
        <span class="nav-user-name">${user.email}</span>
        <span class="nav-role-badge">${user.role}</span>
        <div class="avatar-btn" id="avatar-btn">${initials}
          <div class="dropdown-menu" id="avatar-dropdown">
            <div class="dropdown-item" style="cursor:default;color:var(--slate-500)">
              👤 ${user.fullName}
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" id="logout-btn">🚪 Logout</button>
          </div>
        </div>
      </div>
    </nav>
  `;
}

function initNavbar() {
  const avatarBtn  = document.getElementById('avatar-btn');
  const dropdown   = document.getElementById('avatar-dropdown');
  const logoutBtn  = document.getElementById('logout-btn');

  if (avatarBtn) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.clearSession();
      window.location.href = 'index.html';
    });
  }
}

/* ─── Guard: Redirect if not logged in ─── */
function requireAuth() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/* ─── Filter Utility ─── */
function applyFilters(records, { userId, category, source, from, to }) {
  return records.filter(r => {
    if (userId && r.userId !== userId) return false;
    if (category && r.category !== category) return false;
    if (source   && r.source   !== source)   return false;
    if (from && r.date < from) return false;
    if (to   && r.date > to)   return false;
    return true;
  });
}

/* ─── Badge Mapper ─── */
const CATEGORY_BADGE = {
  'Monthly Salary':                                  'badge-blue',
  'Daily Wages/Labour':                              'badge-gold',
  'Electricity Bill':                                'badge-gold',
  'Appreciation Payment to Sermaraj':                'badge-purple',
  'Additional Items Purchases':                      'badge-slate',
  'Sapling Purchase (மரக்கன்று கொள்முதல்)':         'badge-green',
  'Manure Purchase (எரு/ உரம் கொள்முதல்)':          'badge-green',
  'Ploughing Expenses (உழவுச் செலவுகள்)':           'badge-red',
  'Transport for Labour':                            'badge-gold',
  'Salary For Guardian':                             'badge-blue',
  'Expense - Jasmine (மல்லிகை செலவுகள்)':           'badge-purple',
  'General Topup':                                   'badge-slate',
};

const SOURCE_BADGE = {
  'Income from Jasmine (மல்லிகை வருமானம்)':         'badge-green',
  'Profit from Jasmine (மல்லிகை)':                  'badge-green',
  'Receipt of monthly payment - Ruban':              'badge-blue',
  'Receipt of monthly payment - Siva':               'badge-blue',
  'Receipt of monthly payment - Rajavel':            'badge-blue',
};

function badgeFor(value, map) {
  return `<span class="badge ${map[value] || 'badge-slate'}">${value}</span>`;
}

/* ─── Confirm Dialog ─── */
function confirmAction(message) {
  return window.confirm(message);
}

/* ─── Initialize storage ─── */
store.init();

/* ─── Expose globals ─── */
window.FMS = { store, auth, fmt, genId, buildNavbar, initNavbar, requireAuth,
               applyFilters, KEYS, showToast, badgeFor, CATEGORY_BADGE, SOURCE_BADGE,
               confirmAction, EXPENSE_CATEGORIES, INCOME_SOURCES };
