import { getCategory, formatCurrency, formatDate } from '../utils/format.js'

// Reusable ledger table. Pass `farms` to show a farm column (admin view),
// and onEdit/onDelete to render action buttons.
export default function EntriesTable({ entries, farms, onEdit, onDelete }) {
  const farmName = (id) => farms?.find((f) => f.id === id)?.name || '—'

  if (entries.length === 0) {
    return <p className="empty">No entries found.</p>
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            {farms && <th>Farm</th>}
            <th>Type</th>
            <th className="num">Amount</th>
            <th>Note</th>
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const cat = getCategory(e.categoryId)
            return (
              <tr key={e.id}>
                <td>{formatDate(e.date)}</td>
                <td>
                  {cat.label}
                  {cat.tamil && <small className="tamil"> ({cat.tamil})</small>}
                </td>
                {farms && <td>{farmName(e.farmId)}</td>}
                <td>
                  <span className={`badge ${cat.type}`}>{cat.type}</span>
                </td>
                <td className={`num ${cat.type}`}>
                  {cat.type === 'expense' ? '-' : '+'}
                  {formatCurrency(e.amount)}
                </td>
                <td className="note">{e.note}</td>
                {(onEdit || onDelete) && (
                  <td className="actions">
                    {onEdit && (
                      <button className="btn btn-sm" onClick={() => onEdit(e)}>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(e)}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
