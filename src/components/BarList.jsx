import { formatCurrency } from '../utils/format.js'

// Lightweight CSS bar chart — expense breakdown by category, no chart library.
export default function BarList({ data, title }) {
  const max = Math.max(1, ...data.map((d) => d.amount))

  return (
    <div className="panel">
      <h3 className="panel-title">{title}</h3>
      {data.length === 0 ? (
        <p className="empty">No data for this period.</p>
      ) : (
        <ul className="bar-list">
          {data.map((d) => (
            <li key={d.label}>
              <div className="bar-head">
                <span>{d.label}</span>
                <strong>{formatCurrency(d.amount)}</strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(d.amount / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
