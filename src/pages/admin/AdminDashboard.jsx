import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/mockApi.js'
import SummaryCards from '../../components/SummaryCards.jsx'
import EntriesTable from '../../components/EntriesTable.jsx'
import { summarize, formatCurrency } from '../../utils/format.js'

export default function AdminDashboard() {
  const [entries, setEntries] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getEntries(), api.getFarms()]).then(([e, f]) => {
      setEntries(e)
      setFarms(f)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="empty">Loading…</p>

  const totals = summarize(entries)

  // Per-farm summary rows.
  const perFarm = farms.map((farm) => {
    const farmEntries = entries.filter((e) => e.farmId === farm.id)
    return { farm, ...summarize(farmEntries), count: farmEntries.length }
  })

  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Overview across all farms</p>
        </div>
        <Link to="/admin/entries" className="btn btn-primary">
          + Add / Manage Entries
        </Link>
      </div>

      <SummaryCards income={totals.income} expense={totals.expense} balance={totals.balance} />

      <div className="panel">
        <h3 className="panel-title">Farm Summary</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Farm</th>
                <th>Owner</th>
                <th>Location</th>
                <th className="num">Entries</th>
                <th className="num">Income</th>
                <th className="num">Expense</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {perFarm.map(({ farm, income, expense, balance, count }) => (
                <tr key={farm.id}>
                  <td>{farm.name}</td>
                  <td>{farm.ownerName}</td>
                  <td>{farm.location}</td>
                  <td className="num">{count}</td>
                  <td className="num income">{formatCurrency(income)}</td>
                  <td className="num expense">{formatCurrency(expense)}</td>
                  <td className="num">{formatCurrency(balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">Recent Entries</h3>
        <EntriesTable entries={recent} farms={farms} />
      </div>
    </div>
  )
}
