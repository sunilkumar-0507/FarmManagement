import { formatCurrency } from '../utils/format.js'

// Three KPI cards: income, expense, balance.
export default function SummaryCards({ income, expense, balance }) {
  const cards = [
    { label: 'Total Income', value: income, className: 'card-income', icon: '⬆️' },
    { label: 'Total Expense', value: expense, className: 'card-expense', icon: '⬇️' },
    { label: 'Balance', value: balance, className: balance >= 0 ? 'card-balance' : 'card-expense', icon: '⚖️' },
  ]

  return (
    <div className="cards">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card ${c.className}`}>
          <span className="stat-icon">{c.icon}</span>
          <div>
            <span className="stat-label">{c.label}</span>
            <span className="stat-value">{formatCurrency(c.value)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
