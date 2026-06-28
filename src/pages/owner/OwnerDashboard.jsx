import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/mockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import SummaryCards from '../../components/SummaryCards.jsx'
import BarList from '../../components/BarList.jsx'
import EntriesTable from '../../components/EntriesTable.jsx'
import { summarize, expenseByCategory, monthKey } from '../../utils/format.js'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [farm, setFarm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getEntries(user.farmId), api.getFarms()]).then(([e, farms]) => {
      setEntries(e)
      setFarm(farms.find((f) => f.id === user.farmId) || null)
      setLoading(false)
    })
  }, [user.farmId])

  if (loading) return <p className="empty">Loading…</p>

  const totals = summarize(entries)

  // This month's figures.
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthEntries = entries.filter((e) => monthKey(e.date) === thisMonth)
  const monthTotals = summarize(monthEntries)

  const breakdown = expenseByCategory(entries)
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>{farm?.name} Dashboard</h2>
          <p className="muted">
            {farm?.location} • Owner: {farm?.ownerName}
          </p>
        </div>
        <Link to="/owner/expenses" className="btn btn-primary">
          View Expenses by Date
        </Link>
      </div>

      <h3 className="section-label">Overall (all time)</h3>
      <SummaryCards income={totals.income} expense={totals.expense} balance={totals.balance} />

      <h3 className="section-label">This Month</h3>
      <SummaryCards
        income={monthTotals.income}
        expense={monthTotals.expense}
        balance={monthTotals.balance}
      />

      <div className="two-col">
        <BarList data={breakdown} title="Expenses by Category" />
        <div className="panel">
          <h3 className="panel-title">Recent Activity</h3>
          <EntriesTable entries={recent} />
        </div>
      </div>
    </div>
  )
}
