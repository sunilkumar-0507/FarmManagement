/* ========================================
   EXPENSES PAGE - JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { store, auth, fmt, buildNavbar, initNavbar, requireAuth,
          KEYS, applyFilters, badgeFor, CATEGORY_BADGE, genId, showToast, confirmAction,
          EXPENSE_CATEGORIES } = window.FMS;

  if (!requireAuth()) return;

  document.getElementById('navbar-placeholder').innerHTML = buildNavbar('expenses');
  initNavbar();

  const user    = auth.currentUser();
  const isAdmin = auth.isAdmin();

  const CATEGORIES = EXPENSE_CATEGORIES;

  let editingId = null;
  let allExpenses = [];

  // ─── DOM Refs ───
  const tableBody    = document.getElementById('expense-table-body');
  const totalEl      = document.getElementById('total-amount');
  const countEl      = document.getElementById('record-count');
  const filterCat    = document.getElementById('filter-category');
  const filterFrom   = document.getElementById('filter-from');
  const filterTo     = document.getElementById('filter-to');
  const modal        = document.getElementById('expense-modal');
  const modalTitle   = document.getElementById('modal-title');
  const modalIcon    = document.getElementById('modal-icon');
  const expForm      = document.getElementById('expense-form');

  // ─── Populate filter dropdown ───
  CATEGORIES.forEach(cat => {
    filterCat.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  // ─── Populate form dropdowns ───
  const formCatEl = document.getElementById('form-category');
  CATEGORIES.forEach(cat => {
    formCatEl.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  // ─── Fetch expenses from server ───
  async function fetchExpenses() {
    try {
      const response = await fetch(`/api/expenses?userId=${user.id}`);
      if (response.ok) {
        allExpenses = await response.json();
      } else {
        // Fallback to localStorage
        allExpenses = store.get(KEYS.expenses) || [];
      }
      renderTable();
    } catch (error) {
      console.warn('Failed to fetch from server, using localStorage:', error);
      allExpenses = store.get(KEYS.expenses) || [];
      renderTable();
    }
  }

  // ─── Render Table ───
  function getExpenses() {
    return allExpenses;
  }

  function renderTable() {
    const all = getExpenses();
    const userId   = isAdmin ? null : user.id;
    const category = filterCat.value || null;
    const from     = filterFrom.value || null;
    const to       = filterTo.value   || null;

    const filtered = applyFilters(all, { userId, category, from, to });
    filtered.sort((a,b) => b.date.localeCompare(a.date));

    const users = store.get(KEYS.users) || [];
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.fullName; });

    const total = filtered.reduce((s,e) => s + Number(e.amount), 0);
    totalEl.textContent = fmt.currency(total);
    countEl.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <p>No expenses found. Try adjusting filters or add a new expense.</p>
              <button class="btn btn-danger btn-sm" onclick="document.getElementById('btn-add-expense').click()">+ Add Expense</button>
            </div>
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(e => `
      <tr>
        <td><span class="date-pill">${fmt.date(e.date)}</span></td>
        <td>${badgeFor(e.category, CATEGORY_BADGE)}</td>
        <td>${e.description}</td>
        <td class="amount-negative">${fmt.currency(e.amount)}</td>
        ${isAdmin ? `<td style="color:var(--slate-500);font-size:12px">${userMap[e.userId] || e.userId}</td>` : ''}
        <td>
          <div class="actions-cell">
            <button class="btn-icon-sm" onclick="editExpense('${e.id}')" title="Edit">✏️</button>
            <button class="btn-icon-sm delete" onclick="deleteExpense('${e.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Show/hide Recorded By column header
    const thRecordedBy = document.getElementById('th-recorded-by');
    if (thRecordedBy) thRecordedBy.style.display = isAdmin ? '' : 'none';
  }

  // ─── Filter events ───
  [filterCat, filterFrom, filterTo].forEach(el => el.addEventListener('change', renderTable));
  document.getElementById('btn-filter').addEventListener('click', renderTable);
  document.getElementById('btn-clear-filter').addEventListener('click', () => {
    filterCat.value = '';
    filterFrom.value = '';
    filterTo.value = '';
    renderTable();
  });

  // ─── Modal Open (Add) ───
  document.getElementById('btn-add-expense').addEventListener('click', () => {
    editingId = null;
    modalTitle.textContent = 'Add New Expense';
    modalIcon.textContent  = '💸';
    expForm.reset();
    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
    openModal();
  });

  // ─── Edit ───
  window.editExpense = (id) => {
    const expenses = getExpenses();
    const e = expenses.find(x => x.id === id);
    if (!e) return;
    editingId = id;
    modalTitle.textContent = 'Edit Expense';
    modalIcon.textContent  = '✏️';
    document.getElementById('form-category').value    = e.category;
    document.getElementById('form-description').value = e.description;
    document.getElementById('form-amount').value      = e.amount;
    document.getElementById('form-date').value        = e.date;
    openModal();
  };

  // ─── Delete ───
  window.deleteExpense = async (id) => {
    if (!confirmAction('Are you sure you want to delete this expense?')) return;
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        allExpenses = allExpenses.filter(e => e.id !== id);
        store.set(KEYS.expenses, allExpenses);
        showToast('Expense deleted successfully');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      // Fallback to localStorage
      allExpenses = allExpenses.filter(e => e.id !== id);
      store.set(KEYS.expenses, allExpenses);
      showToast('Expense deleted successfully');
    }
    renderTable();
  };

  // ─── Form Submit ───
  expForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category    = document.getElementById('form-category').value;
    const description = document.getElementById('form-description').value.trim();
    const amount      = parseFloat(document.getElementById('form-amount').value);
    const date        = document.getElementById('form-date').value;

    if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
      showToast('Please fill in all fields correctly', 'error');
      return;
    }

    try {
      if (editingId) {
        // Update existing expense
        const response = await fetch(`/api/expenses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, description, amount, date })
        });

        if (response.ok) {
          allExpenses = allExpenses.map(ex => ex.id === editingId
            ? { ...ex, category, description, amount, date }
            : ex
          );
          store.set(KEYS.expenses, allExpenses);
          showToast('Expense updated successfully');
        } else {
          throw new Error('Failed to update');
        }
      } else {
        // Add new expense
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, category, description, amount, date })
        });

        if (response.ok) {
          const data = await response.json();
          const newExpense = {
            id: data.expenseId,
            userId: user.id,
            category,
            description,
            amount,
            date
          };
          allExpenses.push(newExpense);
          store.set(KEYS.expenses, allExpenses);
          showToast('Expense added successfully');
        } else if (response.status === 503) {
          showToast('Demo Mode: Database unavailable. Viewing demo data only.', 'error');
        } else {
          throw new Error('Failed to add');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error saving expense record. Possibly in demo mode.', 'error');
    }
      console.warn('Server request failed, falling back to localStorage:', error);
      // Fallback to localStorage
      if (editingId) {
        allExpenses = allExpenses.map(ex => ex.id === editingId
          ? { ...ex, category, description, amount, date }
          : ex
        );
        showToast('Expense updated successfully');
      } else {
        allExpenses.push({ id: genId('e'), userId: user.id, category, description, amount, date });
        showToast('Expense added successfully');
      }
      store.set(KEYS.expenses, allExpenses);
    }

    closeModal();
    renderTable();
  });

  // ─── Modal helpers ───
  function openModal()  { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function closeModal() { modal.classList.add('hidden');    document.body.style.overflow = '';        }

  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ─── Column header visibility ───
  if (!isAdmin) {
    const th = document.getElementById('th-recorded-by');
    if (th) th.style.display = 'none';
  }

  // ─── Initial render ───
  fetchExpenses();
});
