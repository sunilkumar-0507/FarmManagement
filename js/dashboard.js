/* ========================================
   DASHBOARD PAGE - JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { store, auth, fmt, buildNavbar, initNavbar, requireAuth,
          KEYS, applyFilters, badgeFor, CATEGORY_BADGE, SOURCE_BADGE } = window.FMS;

  if (!requireAuth()) return;

  // Inject navbar
  document.getElementById('navbar-placeholder').innerHTML = buildNavbar('dashboard');
  initNavbar();

  const user    = auth.currentUser();
  const isAdmin = auth.isAdmin();

  // Load data from server
  async function loadDashboardData() {
    try {
      // Fetch expenses
      const expResponse = await fetch(`/api/expenses?userId=${isAdmin ? '' : user.id}`);
      const allExpenses = expResponse.ok ? await expResponse.json() : (store.get(KEYS.expenses) || []);

      // Fetch incomes
      const incResponse = await fetch(`/api/income?userId=${isAdmin ? '' : user.id}`);
      const allIncomes = incResponse.ok ? await incResponse.json() : (store.get(KEYS.incomes) || []);

      displayDashboard(allExpenses, allIncomes);
    } catch (error) {
      console.warn('Failed to fetch from server, using localStorage:', error);
      const allExpenses = store.get(KEYS.expenses) || [];
      const allIncomes = store.get(KEYS.incomes) || [];
      displayDashboard(allExpenses, allIncomes);
    }
  }

  function displayDashboard(allExpenses, allIncomes) {
    // Filter by user if not admin
    const expenses = isAdmin ? allExpenses : allExpenses.filter(e => e.user_id === user.id);
    const incomes  = isAdmin ? allIncomes  : allIncomes.filter(i => i.user_id === user.id);

    // ─── Stats ───
    const totalIncome   = incomes.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const netProfit     = totalIncome - totalExpenses;

    document.getElementById('stat-income').textContent   = fmt.currency(totalIncome);
    document.getElementById('stat-expense').textContent  = fmt.currency(totalExpenses);
    document.getElementById('stat-profit').textContent   = (netProfit >= 0 ? '+' : '') + fmt.currency(netProfit);
    document.getElementById('stat-profit-card').className =
      'stat-card ' + (netProfit >= 0 ? 'stat-card-profit' : 'stat-card-expense');

    // ─── Expense Bar Chart ───
    const expByCat = {};
    expenses.forEach(e => { expByCat[e.category] = (expByCat[e.category] || 0) + Number(e.amount); });
    const expCats = Object.entries(expByCat).sort((a,b) => b[1]-a[1]).slice(0,6);
    const maxExp  = Math.max(...expCats.map(c=>c[1]), 1);

    const expChartEl = document.getElementById('expense-chart');
    if (expCats.length) {
      expChartEl.innerHTML = expCats.map(([cat, amt]) => `
        <div class="bar-group">
          <div class="bar-val">${fmt.currency(amt).replace('$','$')}</div>
          <div class="bar" style="height:${Math.round(amt/maxExp*100)}%" title="${cat}: ${fmt.currency(amt)}"></div>
          <div class="bar-lbl">${cat}</div>
        </div>
      `).join('');
    } else {
      expChartEl.innerHTML = '<div style="text-align:center;padding:40px;color:#718096;font-size:13px">No expense data yet</div>';
    }

    // ─── Income Donut (SVG) ───
    const incBySrc = {};
    incomes.forEach(i => { incBySrc[i.source] = (incBySrc[i.source] || 0) + Number(i.amount); });
    const incSrcs = Object.entries(incBySrc).sort((a,b) => b[1]-a[1]).slice(0,5);

    const DONUT_COLORS = ['#3aaa58','#3563d4','#f59e0b','#e53e3e','#8b5cf6'];
    const total = incSrcs.reduce((s,[,v]) => s+v, 0);
    const R = 42, CX = 55, CY = 55, CIRC = 2*Math.PI*R;

    let offset = 0;
    const donutSegs = incSrcs.map(([,amt], i) => {
      const pct  = amt / Math.max(total, 1);
      const dash = pct * CIRC;
      const seg  = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none"
        stroke="${DONUT_COLORS[i]}" stroke-width="18"
        stroke-dasharray="${dash.toFixed(2)} ${(CIRC-dash).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}" stroke-linecap="butt"/>`;
      offset += dash;
      return seg;
    }).join('');

    const donutSvgEl = document.getElementById('donut-svg');
    if (total > 0) {
      donutSvgEl.innerHTML = `
        <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#e2e8f0" stroke-width="18"/>
        ${donutSegs}
        <text x="${CX}" y="${CY-6}" text-anchor="middle" font-size="11" font-weight="700" fill="#1a202c">${fmt.currency(total)}</text>
        <text x="${CX}" y="${CY+10}" text-anchor="middle" font-size="9" fill="#718096">Total</text>
      `;
    } else {
      donutSvgEl.innerHTML = `<text x="55" y="60" text-anchor="middle" font-size="10" fill="#718096">No data</text>`;
    }

    // Donut legend
    const legendEl = document.getElementById('donut-legend');
    legendEl.innerHTML = incSrcs.map(([src, amt], i) => `
      <div class="legend-row">
        <div class="legend-dot" style="background:${DONUT_COLORS[i]}"></div>
        <span class="legend-name">${src}</span>
        <span class="legend-amount">${fmt.currency(amt)}</span>
      </div>
    `).join('') || '<span style="color:#718096;font-size:12px">No income data yet</span>';

    // ─── Recent Transactions ───
    const recentExp = [...expenses].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
    const recentInc = [...incomes].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);

    const users = store.get(KEYS.users) || [];
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.fullName; });

    const expListEl = document.getElementById('recent-expenses');
    expListEl.innerHTML = recentExp.length ? recentExp.map(e => `
      <div class="txn-item">
        <div class="txn-icon" style="background:#fff0f0">💸</div>
        <div class="txn-info">
          <div class="txn-name">${e.description}</div>
          <div class="txn-meta">${badgeFor(e.category, CATEGORY_BADGE)} ${fmt.date(e.date)}</div>
        </div>
        <div class="txn-amount expense">-${fmt.currency(e.amount)}</div>
      </div>
    `).join('') : '<div class="empty-state"><span class="empty-icon">📭</span><p>No expenses yet</p></div>';

    const incListEl = document.getElementById('recent-incomes');
    incListEl.innerHTML = recentInc.length ? recentInc.map(i => `
      <div class="txn-item">
        <div class="txn-icon" style="background:#f0fdf4">💰</div>
        <div class="txn-info">
          <div class="txn-name">${i.description}</div>
          <div class="txn-meta">${badgeFor(i.source, SOURCE_BADGE)} ${fmt.date(i.date)}</div>
        </div>
        <div class="txn-amount income">+${fmt.currency(i.amount)}</div>
      </div>
    `).join('') : '<div class="empty-state"><span class="empty-icon">📭</span><p>No income yet</p></div>';

    // Set date
    const now = new Date();
    document.getElementById('current-date').textContent =
      now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // Welcome
    document.getElementById('welcome-name').textContent = user.fullName;
    document.getElementById('welcome-role').textContent = user.role;
  }

  // Load dashboard data on page load
  loadDashboardData();
});
