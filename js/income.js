/* ========================================
   INCOME PAGE - JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { store, auth, fmt, buildNavbar, initNavbar, requireAuth,
          KEYS, applyFilters, badgeFor, SOURCE_BADGE, genId, showToast, confirmAction,
          INCOME_SOURCES } = window.FMS;

  if (!requireAuth()) return;

  document.getElementById('navbar-placeholder').innerHTML = buildNavbar('income');
  initNavbar();

  const user    = auth.currentUser();
  const isAdmin = auth.isAdmin();

  const SOURCES = INCOME_SOURCES;

  let editingId = null;

  const tableBody  = document.getElementById('income-table-body');
  const totalEl    = document.getElementById('total-amount');
  const countEl    = document.getElementById('record-count');
  const filterSrc  = document.getElementById('filter-source');
  const filterFrom = document.getElementById('filter-from');
  const filterTo   = document.getElementById('filter-to');
  const modal      = document.getElementById('income-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalIcon  = document.getElementById('modal-icon');
  const incForm    = document.getElementById('income-form');

  // Populate dropdowns
  SOURCES.forEach(src => {
    filterSrc.innerHTML += `<option value="${src}">${src}</option>`;
    document.getElementById('form-source').innerHTML += `<option value="${src}">${src}</option>`;
  });

  let allIncomes = [];

  // ─── Fetch incomes from server ───
  async function fetchIncomes() {
    try {
      const response = await fetch(`/api/income?userId=${user.id}`);
      if (response.ok) {
        allIncomes = await response.json();
      } else {
        // Fallback to localStorage
        allIncomes = store.get(KEYS.incomes) || [];
      }
      renderTable();
    } catch (error) {
      console.warn('Failed to fetch from server, using localStorage:', error);
      allIncomes = store.get(KEYS.incomes) || [];
      renderTable();
    }
  }

  function getIncomes() {
    return allIncomes;
  }

  function renderTable() {
    const all    = getIncomes();
    const userId = isAdmin ? null : user.id;
    const source = filterSrc.value  || null;
    const from   = filterFrom.value || null;
    const to     = filterTo.value   || null;

    const filtered = applyFilters(all, { userId, source, from, to });
    filtered.sort((a,b) => b.date.localeCompare(a.date));

    const users = store.get(KEYS.users) || [];
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.fullName; });

    const total = filtered.reduce((s,i) => s + Number(i.amount), 0);
    totalEl.textContent = fmt.currency(total);
    countEl.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No income records found. Add your first income entry.</p>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-income').click()">+ Add Income</button>
            </div>
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(i => `
      <tr>
        <td><span class="date-pill">${fmt.date(i.date)}</span></td>
        <td>${badgeFor(i.source, SOURCE_BADGE)}</td>
        <td>${i.description}</td>
        <td class="amount-positive">${fmt.currency(i.amount)}</td>
        ${isAdmin ? `<td style="color:var(--slate-500);font-size:12px">${userMap[i.userId] || i.userId}</td>` : ''}
        <td>
          <div class="actions-cell">
            <button class="btn-icon-sm" onclick="editIncome('${i.id}')" title="Edit">✏️</button>
            <button class="btn-icon-sm delete" onclick="deleteIncome('${i.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    const thBy = document.getElementById('th-recorded-by');
    if (thBy) thBy.style.display = isAdmin ? '' : 'none';
  }

  // Load incomes on page load
  fetchIncomes();

  [filterSrc, filterFrom, filterTo].forEach(el => el.addEventListener('change', renderTable));
  document.getElementById('btn-filter').addEventListener('click', renderTable);
  document.getElementById('btn-clear-filter').addEventListener('click', () => {
    filterSrc.value = '';
    filterFrom.value = '';
    filterTo.value = '';
    renderTable();
  });

  document.getElementById('btn-add-income').addEventListener('click', () => {
    editingId = null;
    modalTitle.textContent = 'Add New Income';
    modalIcon.textContent  = '💰';
    incForm.reset();
    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
    openModal();
  });

  window.editIncome = (id) => {
    const incomes = getIncomes();
    const inc = incomes.find(x => x.id === id);
    if (!inc) return;
    editingId = id;
    modalTitle.textContent = 'Edit Income';
    modalIcon.textContent  = '✏️';
    document.getElementById('form-source').value      = inc.source;
    document.getElementById('form-description').value = inc.description;
    document.getElementById('form-amount').value      = inc.amount;
    document.getElementById('form-date').value        = inc.date;
    openModal();
  };

  window.deleteIncome = async (id) => {
    if (!confirmAction('Are you sure you want to delete this income record?')) return;
    try {
      const response = await fetch(`/api/income/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showToast('Income record deleted');
      fetchIncomes(); // Refresh data from API
    } catch (error) {
      console.error('Error:', error);
      showToast('Error deleting income record', 'error');
    }
  };

  incForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const source      = document.getElementById('form-source').value;
    const description = document.getElementById('form-description').value.trim();
    const amount      = parseFloat(document.getElementById('form-amount').value);
    const date        = document.getElementById('form-date').value;

    if (!source || !description || isNaN(amount) || amount <= 0 || !date) {
      showToast('Please fill in all fields correctly', 'error');
      return;
    }

    try {
      if (editingId) {
        // Update via API
        const response = await fetch(`/api/income/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source, description, amount, date })
        });
        if (!response.ok) throw new Error('Failed to update');
        showToast('Income updated successfully');
      } else {
        // Create via API
        const response = await fetch('/api/income', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, source, description, amount, date })
        });
        if (!response.ok) throw new Error('Failed to add');
        showToast('Income added successfully');
      }
      closeModal();
      fetchIncomes(); // Refresh data from API
    } catch (error) {
      console.error('Error:', error);
      showToast('Error saving income record', 'error');
    }
  });

  function openModal()  { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.add('hidden');    document.body.style.overflow = '';        }

  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  if (!isAdmin) {
    const th = document.getElementById('th-recorded-by');
    if (th) th.style.display = 'none';
  }

  renderTable();
});
