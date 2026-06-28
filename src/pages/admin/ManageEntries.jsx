import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/mockApi.js'
import EntriesTable from '../../components/EntriesTable.jsx'
import { getCategory } from '../../utils/format.js'

const emptyForm = (farmId = '') => ({
  farmId,
  date: new Date().toISOString().slice(0, 10),
  categoryId: '',
  amount: '',
  note: '',
})

export default function ManageEntries() {
  const [entries, setEntries] = useState([])
  const [farms, setFarms] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [filterFarm, setFilterFarm] = useState('all')

  async function loadEntries() {
    const e = await api.getEntries()
    setEntries(e)
  }

  useEffect(() => {
    Promise.all([api.getEntries(), api.getFarms(), api.getCategories()]).then(
      ([e, f, c]) => {
        setEntries(e)
        setFarms(f)
        setCategories(c)
        setForm(emptyForm(f[0]?.id || ''))
        setLoading(false)
      },
    )
  }, [])

  const visibleEntries = useMemo(() => {
    const list = filterFarm === 'all' ? entries : entries.filter((e) => e.farmId === filterFarm)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [entries, filterFarm])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function resetForm() {
    setForm(emptyForm(farms[0]?.id || ''))
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.farmId || !form.categoryId || !form.amount) return
    setSaving(true)
    try {
      if (editingId) {
        await api.updateEntry(editingId, form)
      } else {
        await api.addEntry(form)
      }
      await loadEntries()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(entry) {
    setEditingId(entry.id)
    setForm({
      farmId: entry.farmId,
      date: entry.date,
      categoryId: entry.categoryId,
      amount: String(entry.amount),
      note: entry.note || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(entry) {
    if (!window.confirm(`Delete this ${getCategory(entry.categoryId).label} entry?`)) return
    await api.deleteEntry(entry.id)
    await loadEntries()
    if (editingId === entry.id) resetForm()
  }

  if (loading) return <p className="empty">Loading…</p>

  const income = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Manage Entries</h2>
          <p className="muted">Add farm income & expense records</p>
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <h3 className="panel-title">{editingId ? 'Edit Entry' : 'New Entry'}</h3>
        <div className="grid">
          <label>
            Farm
            <select value={form.farmId} onChange={(e) => setField('farmId', e.target.value)} required>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.ownerName})
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} required />
          </label>

          <label>
            Description / Category
            <select
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
              required
            >
              <option value="">— Select —</option>
              <optgroup label="Income / Receipts">
                {income.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {c.tamil ? ` (${c.tamil})` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expenses">
                {expense.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {c.tamil ? ` (${c.tamil})` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              min="0"
              step="1"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              placeholder="0"
              required
            />
          </label>

          <label className="span-2">
            Note
            <input
              type="text"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
              placeholder="Optional details"
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Add Entry'}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">All Entries ({visibleEntries.length})</h3>
          <label className="inline-filter">
            Filter by farm
            <select value={filterFarm} onChange={(e) => setFilterFarm(e.target.value)}>
              <option value="all">All farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <EntriesTable
          entries={visibleEntries}
          farms={farms}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
