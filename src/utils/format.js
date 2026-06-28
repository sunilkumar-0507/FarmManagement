import { CATEGORIES } from '../data/mockData.js'

const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

export function getCategory(id) {
  return categoryById[id] || { id, label: id, type: 'expense', tamil: '' }
}

// Indian Rupee formatting, e.g. ₹1,23,456
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

export function formatDate(iso) {
  const date = new Date(iso + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Returns { income, expense, balance } for a list of entries.
export function summarize(entries) {
  let income = 0
  let expense = 0
  for (const e of entries) {
    const cat = getCategory(e.categoryId)
    if (cat.type === 'income') income += Number(e.amount)
    else expense += Number(e.amount)
  }
  return { income, expense, balance: income - expense }
}

// Group expense totals by category label (expenses only).
export function expenseByCategory(entries) {
  const map = new Map()
  for (const e of entries) {
    const cat = getCategory(e.categoryId)
    if (cat.type !== 'expense') continue
    map.set(cat.label, (map.get(cat.label) || 0) + Number(e.amount))
  }
  return [...map.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount)
}

// YYYY-MM for a given ISO date string.
export function monthKey(iso) {
  return iso.slice(0, 7)
}
