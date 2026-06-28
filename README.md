# 🌿 Farm Management

A React + Vite app for managing farm income & expenses, with role-based logins.
Currently runs on **mock data** through a swappable API layer — wire it to a real
backend later by editing one file.

## Features

- **4 logins** — 1 admin + 3 farm owners (Ruban, Siva, Rajavel).
- **Admin** can add / edit / delete ledger entries for any farm, using the exact
  income & expense categories from the farm sheet (English + Tamil labels).
- **Owners** see a dashboard of their own farm: total income, expense, balance,
  this-month figures, an expense-by-category chart, and recent activity.
- **Expenses by date / month** — owners filter records by a specific date or
  month and see the totals and breakdown for that period.
- Indian Rupee formatting, responsive layout (works on mobile), session kept in
  `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

### Demo accounts

| Role  | Username  | Password    |
| ----- | --------- | ----------- |
| Admin | `admin`   | `admin123`  |
| Owner | `ruban`   | `ruban123`  |
| Owner | `siva`    | `siva123`   |
| Owner | `rajavel` | `rajavel123`|

(On the login screen you can click a demo chip to auto-fill.)

## Project structure

```
src/
  api/mockApi.js          # Mock API — swap bodies for fetch() to go live
  data/mockData.js        # Categories, users, farms, seed entries
  context/AuthContext.jsx # Login state + localStorage session
  components/             # Layout, table, cards, bar chart, route guard
  pages/
    Login.jsx
    admin/AdminDashboard.jsx
    admin/ManageEntries.jsx
    owner/OwnerDashboard.jsx
    owner/OwnerExpenses.jsx
  utils/format.js         # Currency/date formatting + summaries
```

## Connecting a real backend

Every screen talks only to `src/api/mockApi.js`. Replace each method body with a
real HTTP call (keeping the same return shapes) and the UI keeps working:

```js
async getEntries(farmId) {
  const res = await fetch(`/api/entries?farmId=${farmId ?? ''}`)
  return res.json()
}
```

Categories live in `src/data/mockData.js` (`CATEGORIES`) — edit there to add or
rename ledger descriptions.
