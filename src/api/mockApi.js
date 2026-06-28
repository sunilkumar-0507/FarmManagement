// ---------------------------------------------------------------------------
// Mock API. Simulates async network calls against in-memory data so the UI is
// written exactly as it would be against a real backend. To go live, replace
// each function body with a fetch()/axios call to your server.
// ---------------------------------------------------------------------------
import { USERS, FARMS, CATEGORIES, ENTRIES } from '../data/mockData.js'

// In-memory mutable copy so add/edit/delete persist for the session.
let entries = [...ENTRIES]
let nextId = entries.length + 1

// Fake network latency.
const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms))

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export const api = {
  async login(username, password) {
    await delay()
    const user = USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password,
    )
    if (!user) {
      throw new Error('Invalid username or password')
    }
    // Never expose the password to the client state.
    const { password: _pw, ...safeUser } = user
    return clone(safeUser)
  },

  async getCategories() {
    await delay(120)
    return clone(CATEGORIES)
  },

  async getFarms() {
    await delay(120)
    return clone(FARMS)
  },

  // Pass farmId to scope to a single farm (owner view); omit for all (admin).
  async getEntries(farmId = null) {
    await delay()
    const list = farmId ? entries.filter((e) => e.farmId === farmId) : entries
    return clone(list)
  },

  async addEntry(entry) {
    await delay()
    const created = { ...entry, id: `e${nextId++}`, amount: Number(entry.amount) }
    entries = [created, ...entries]
    return clone(created)
  },

  async updateEntry(id, patch) {
    await delay()
    const idx = entries.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('Entry not found')
    entries[idx] = { ...entries[idx], ...patch, amount: Number(patch.amount ?? entries[idx].amount) }
    return clone(entries[idx])
  },

  async deleteEntry(id) {
    await delay()
    entries = entries.filter((e) => e.id !== id)
    return { ok: true }
  },
}
