// ---------------------------------------------------------------------------
// Mock data for the Farm Management app.
// Swap this module for real API calls later — the shapes below mirror what a
// backend would return.
// ---------------------------------------------------------------------------

// Transaction categories taken from the farm ledger sheet.
// `type` drives whether an entry adds to income or expense totals.
export const CATEGORIES = [
  // --- Income / receipts ---
  { id: 'income_jasmine', label: 'Income from Jasmine', tamil: 'மல்லிகை வருமானம்', type: 'income' },
  { id: 'profit_jasmine', label: 'Profit from Jasmine', tamil: 'மல்லிகை', type: 'income' },
  { id: 'general_topup', label: 'General Topup', tamil: '', type: 'income' },
  { id: 'receipt_ruban', label: 'Receipt of monthly payment - Ruban', tamil: '', type: 'income' },
  { id: 'receipt_siva', label: 'Receipt of monthly payment - Siva', tamil: '', type: 'income' },
  { id: 'receipt_rajavel', label: 'Receipt of monthly payment - Rajavel', tamil: '', type: 'income' },

  // --- Expenses ---
  { id: 'monthly_salary', label: 'Monthly Salary', tamil: '', type: 'expense' },
  { id: 'daily_wages', label: 'Daily Wages / Labour', tamil: '', type: 'expense' },
  { id: 'electricity', label: 'Electricity Bill', tamil: '', type: 'expense' },
  { id: 'appreciation_sermaraj', label: 'Appreciation Payment to Sermaraj', tamil: '', type: 'expense' },
  { id: 'additional_items', label: 'Additional Items Purchases', tamil: '', type: 'expense' },
  { id: 'sapling_purchase', label: 'Sapling Purchase', tamil: 'மரக்கன்று கொள்முதல்', type: 'expense' },
  { id: 'manure_purchase', label: 'Manure Purchase', tamil: 'எரு / உரம் கொள்முதல்', type: 'expense' },
  { id: 'ploughing', label: 'Ploughing Expenses', tamil: 'உழவுச் செலவுகள்', type: 'expense' },
  { id: 'transport', label: 'Transport for Labour / Things', tamil: '', type: 'expense' },
  { id: 'salary_guardian', label: 'Salary For Guardian', tamil: '', type: 'expense' },
  { id: 'expense_jasmine', label: 'Expense - Jasmine', tamil: 'மல்லிகை செலவுகள்', type: 'expense' },
  { id: 'livestock', label: 'Live Stock Purchase', tamil: '', type: 'expense' },
]

// Three farms, one per owner.
export const FARMS = [
  { id: 'farm_ruban', name: 'Ruban Farm', location: 'Tenkasi', ownerName: 'Ruban' },
  { id: 'farm_siva', name: 'Siva Farm', location: 'Tirunelveli', ownerName: 'Siva' },
  { id: 'farm_rajavel', name: 'Rajavel Farm', location: 'Sankarankovil', ownerName: 'Rajavel' },
]

// 4 logins: 1 admin + 3 owners. (Plain-text passwords are fine for a mock.)
export const USERS = [
  { id: 'u_admin', username: 'admin', password: 'admin123', name: 'Farm Admin', role: 'admin', farmId: null },
  { id: 'u_ruban', username: 'ruban', password: 'ruban123', name: 'Ruban', role: 'owner', farmId: 'farm_ruban' },
  { id: 'u_siva', username: 'siva', password: 'siva123', name: 'Siva', role: 'owner', farmId: 'farm_siva' },
  { id: 'u_rajavel', username: 'rajavel', password: 'rajavel123', name: 'Rajavel', role: 'owner', farmId: 'farm_rajavel' },
]

// Helper to build a date string for the current/previous months so the
// date & month filters have something to show against today's date.
const d = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

// Seed ledger entries spread across recent months and all three farms.
export const ENTRIES = [
  // ---- Ruban Farm ----
  { id: 'e1', farmId: 'farm_ruban', date: d(2026, 6, 2), categoryId: 'general_topup', amount: 50000, note: 'Season capital top-up' },
  { id: 'e2', farmId: 'farm_ruban', date: d(2026, 6, 5), categoryId: 'sapling_purchase', amount: 8200, note: '300 jasmine saplings' },
  { id: 'e3', farmId: 'farm_ruban', date: d(2026, 6, 6), categoryId: 'manure_purchase', amount: 4500, note: 'Organic manure 2 loads' },
  { id: 'e4', farmId: 'farm_ruban', date: d(2026, 6, 10), categoryId: 'daily_wages', amount: 3600, note: '6 labourers' },
  { id: 'e5', farmId: 'farm_ruban', date: d(2026, 6, 12), categoryId: 'income_jasmine', amount: 12400, note: 'Jasmine sale - market' },
  { id: 'e6', farmId: 'farm_ruban', date: d(2026, 6, 18), categoryId: 'electricity', amount: 1850, note: 'Pump set bill' },
  { id: 'e7', farmId: 'farm_ruban', date: d(2026, 6, 20), categoryId: 'income_jasmine', amount: 9800, note: 'Jasmine sale' },
  { id: 'e8', farmId: 'farm_ruban', date: d(2026, 6, 25), categoryId: 'receipt_ruban', amount: 15000, note: 'Monthly payment received' },
  { id: 'e9', farmId: 'farm_ruban', date: d(2026, 5, 8), categoryId: 'monthly_salary', amount: 12000, note: 'Field supervisor' },
  { id: 'e10', farmId: 'farm_ruban', date: d(2026, 5, 14), categoryId: 'ploughing', amount: 5200, note: 'Tractor ploughing' },
  { id: 'e11', farmId: 'farm_ruban', date: d(2026, 5, 22), categoryId: 'profit_jasmine', amount: 18600, note: 'Net profit jasmine batch' },
  { id: 'e12', farmId: 'farm_ruban', date: d(2026, 4, 11), categoryId: 'transport', amount: 2100, note: 'Transport to market' },

  // ---- Siva Farm ----
  { id: 'e13', farmId: 'farm_siva', date: d(2026, 6, 3), categoryId: 'general_topup', amount: 40000, note: 'Capital top-up' },
  { id: 'e14', farmId: 'farm_siva', date: d(2026, 6, 7), categoryId: 'livestock', amount: 22000, note: '2 milch cows' },
  { id: 'e15', farmId: 'farm_siva', date: d(2026, 6, 9), categoryId: 'daily_wages', amount: 2400, note: '4 labourers' },
  { id: 'e16', farmId: 'farm_siva', date: d(2026, 6, 15), categoryId: 'income_jasmine', amount: 8700, note: 'Jasmine sale' },
  { id: 'e17', farmId: 'farm_siva', date: d(2026, 6, 19), categoryId: 'additional_items', amount: 1600, note: 'Spray equipment' },
  { id: 'e18', farmId: 'farm_siva', date: d(2026, 6, 26), categoryId: 'receipt_siva', amount: 15000, note: 'Monthly payment received' },
  { id: 'e19', farmId: 'farm_siva', date: d(2026, 5, 5), categoryId: 'salary_guardian', amount: 7000, note: 'Night guardian' },
  { id: 'e20', farmId: 'farm_siva', date: d(2026, 5, 17), categoryId: 'expense_jasmine', amount: 3300, note: 'Jasmine upkeep' },
  { id: 'e21', farmId: 'farm_siva', date: d(2026, 5, 28), categoryId: 'income_jasmine', amount: 11200, note: 'Jasmine sale' },
  { id: 'e22', farmId: 'farm_siva', date: d(2026, 4, 20), categoryId: 'manure_purchase', amount: 3900, note: 'Manure' },

  // ---- Rajavel Farm ----
  { id: 'e23', farmId: 'farm_rajavel', date: d(2026, 6, 1), categoryId: 'general_topup', amount: 45000, note: 'Capital top-up' },
  { id: 'e24', farmId: 'farm_rajavel', date: d(2026, 6, 4), categoryId: 'sapling_purchase', amount: 6700, note: 'Saplings' },
  { id: 'e25', farmId: 'farm_rajavel', date: d(2026, 6, 11), categoryId: 'appreciation_sermaraj', amount: 5000, note: 'Appreciation payment' },
  { id: 'e26', farmId: 'farm_rajavel', date: d(2026, 6, 16), categoryId: 'income_jasmine', amount: 10400, note: 'Jasmine sale' },
  { id: 'e27', farmId: 'farm_rajavel', date: d(2026, 6, 22), categoryId: 'electricity', amount: 2050, note: 'Pump bill' },
  { id: 'e28', farmId: 'farm_rajavel', date: d(2026, 6, 27), categoryId: 'receipt_rajavel', amount: 15000, note: 'Monthly payment received' },
  { id: 'e29', farmId: 'farm_rajavel', date: d(2026, 5, 9), categoryId: 'daily_wages', amount: 3000, note: '5 labourers' },
  { id: 'e30', farmId: 'farm_rajavel', date: d(2026, 5, 19), categoryId: 'profit_jasmine', amount: 14300, note: 'Profit jasmine batch' },
  { id: 'e31', farmId: 'farm_rajavel', date: d(2026, 5, 25), categoryId: 'transport', amount: 1800, note: 'Transport' },
  { id: 'e32', farmId: 'farm_rajavel', date: d(2026, 4, 14), categoryId: 'monthly_salary', amount: 11000, note: 'Supervisor salary' },
]
