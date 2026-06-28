import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/mockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import SummaryCards from '../../components/SummaryCards.jsx'
import BarList from '../../components/BarList.jsx'
import EntriesTable from '../../components/EntriesTable.jsx'
import { summarize, expenseByCategory, getCategory, monthKey } from '../../utils/format.js'

export default function OwnerExpenses() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [mode, setMode] = useState('month') // 'day' | 'month' | 'all'
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10))
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'income' | 'expense'

  useEffect(() => {
    api.getEntries(user.farmId).then((e) => {
      setEntries(e)
      setLoading(false)
    })
  }, [user.farmId])

  const filtered = useMemo(() => {
    let list = entries
    if (mode === 'day') list = list.filter((e) => e.date === day)
    else if (mode === 'month') list = list.filter((e) => monthKey(e.date) === month)

    if (typeFilter !== 'all') {
      list = list.filter((e) => getCategory(e.categoryId).type === typeFilter)
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [entries, mode, day, month, typeFilter])

  if (loading) return <p className="empty">Loading…</p>

  const totals = summarize(filtered)
  const breakdown = expenseByCategory(filtered)

  const periodLabel =
    mode === 'day'
      ? new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { dateStyle: 'medium' })
      : mode === 'month'
        ? new Date(month + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : 'All time'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Expenses & Income</h2>
          <p className="muted">View records for a selected date or month</p>
        </div>
      </div>

      <div className="panel filter-panel">
        <div className="seg">
          {[
            { key: 'day', label: 'By Date' },
            { key: 'month', label: 'By Month' },
            { key: 'all', label: 'All' },
          ].map((m) => (
            <button
              key={m.key}
              className={`seg-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'day' && (
          <label className="inline-filter">
            Date
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </label>
        )}
        {mode === 'month' && (
          <label className="inline-filter">
            Month
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
        )}

        <label className="inline-filter">
          Show
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Income & Expense</option>
            <option value="expense">Expenses only</option>
            <option value="income">Income only</option>
          </select>
        </label>
      </div>

      <h3 className="section-label">Showing: {periodLabel}</h3>
      <SummaryCards income={totals.income} expense={totals.expense} balance={totals.balance} />

      <div className="two-col">
        <BarList data={breakdown} title="Expense Breakdown" />
        <div className="panel">
          <h3 className="panel-title">Records ({filtered.length})</h3>
          <EntriesTable entries={filtered} />
        </div>
      </div>
    </div>
  )
}
