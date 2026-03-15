# Expense Management System - Setup Guide

## Overview
Your Farm Management System now has a complete expense entry and dashboard integration system. Users can enter expenses on the **Expenses page**, and the data will automatically display on the **Dashboard**.

---

## How to Use

### 1. **Accessing the Expense Page**
- Navigate to `expenses.html` or click "📉 Expenses" in the navbar
- You'll see a list of all expenses with filtering options

### 2. **Adding a New Expense**
- Click the **"+ Add Expense"** button in the top-right
- A modal form will appear with the following fields:
  - **Category**: Select from predefined expense categories (e.g., "Monthly Salary", "Daily Wages/Labour", etc.)
  - **Description**: Enter details about the expense
  - **Amount**: Enter the expense amount (in your currency)
  - **Date**: Select the date of the expense
- Click **"💾 Save Expense"** to submit

### 3. **Editing an Expense**
- Click the **"✏️"** (edit) icon next to any expense in the table
- The modal will open with the expense data pre-filled
- Make your changes and click **"💾 Save Expense"**

### 4. **Deleting an Expense**
- Click the **"🗑️"** (delete) icon next to any expense in the table
- Confirm the deletion in the popup

### 5. **Filtering Expenses**
- Use the **Filter Bar** at the top to narrow down results:
  - **Category**: Filter by expense category
  - **From Date**: Show expenses from a specific date onwards
  - **To Date**: Show expenses up to a specific date
- Click **"⚙ Filter"** to apply or **"✕ Clear"** to reset filters

---

## Dashboard Integration

### What Appears on the Dashboard?

1. **Total Expenses Card** (📉)
   - Shows the sum of all expenses
   - Redirects to Expenses page when clicked

2. **Expense Bar Chart** (📉 Expenses by Category)
   - Displays top 6 expense categories by amount
   - Visual bars show relative expense amounts
   - Top categories appear at the top

3. **Recent Expenses Section** (🕐 Recent Expenses)
   - Shows the 5 most recent expenses
   - Displays: Description, Category, Date, and Amount
   - Direct link to view all expenses

4. **Net Profit Calculation** (🏆)
   - Automatically calculated as: Income - Expenses
   - Updates whenever expenses change

---

## Data Storage

### Backend (MySQL Database)
- Expenses are stored in the `expenses` table with:
  - `id`: Auto-increment ID
  - `user_id`: Associated user
  - `amount`: Expense amount
  - `category`: Expense category
  - `description`: Description
  - `date`: Expense date

### Fallback (LocalStorage)
- If the server is unavailable, data is automatically saved to browser localStorage
- When the server is back online, new expenses will sync to the database

---

## Expense Categories Available

By default, the following categories are available:

- Monthly Salary
- Daily Wages/Labour
- Electricity Bill
- Appreciation Payment to Sermaraj
- Additional Items Purchases
- Sapling Purchase (மரக்கன்று கொள்முதல்)
- Manure Purchase (எரு/ உரம் கொள்முதல்)
- Ploughing Expenses (உழவுச் செலவுகள்)
- Transport for Labour
- Salary For Guardian
- Expense - Jasmine (மல்லிகை செலவுகள்)
- General Topup

To add more categories, edit the `EXPENSE_CATEGORIES` array in `js/app.js`.

---

## API Endpoints

The backend provides the following REST API endpoints:

### Expenses Endpoints
- **GET** `/api/expenses` - Fetch all expenses (with optional `userId` query parameter)
- **POST** `/api/expenses` - Create a new expense
- **PUT** `/api/expenses/:id` - Update an expense
- **DELETE** `/api/expenses/:id` - Delete an expense

### Income Endpoints
- **GET** `/api/income` - Fetch all income entries
- **POST** `/api/income` - Create new income
- **PUT** `/api/income/:id` - Update income
- **DELETE** `/api/income/:id` - Delete income

---

## User Roles

### Admin/Farm Owner
- Can see all expenses from all users
- Can view all users in the "Recorded By" column

### Farm Worker
- Can only see their own expenses
- Cannot see other users' data

---

## Troubleshooting

### Expenses Not Appearing on Dashboard
1. **Check Server Connection**: Ensure the server is running (Node.js server should be listening on port 3000)
2. **Check Database**: Verify MySQL is running and the `farm_db` database exists
3. **Check Browser Console**: Open Developer Tools (F12) and check for error messages
4. **Check localStorage**: If server is down, expenses are saved locally but may not sync

### Data Not Persisting
1. Verify MySQL connection is working
2. Check that expenses table exists in the database
3. Look at server console for error messages

### Clear All Data (Reset)
To reset all data and reload default values:
1. Open browser Dev Tools (F12)
2. Go to Application → Local Storage
3. Delete the `fms_version` key
4. Refresh the page

---

## Customization Tips

### Add More Expense Categories
Edit `js/app.js` and add to the `EXPENSE_CATEGORIES` array:
```javascript
const EXPENSE_CATEGORIES = [
  'Monthly Salary',
  'Your New Category',
  // ... other categories
];
```

### Change Currency Symbol
Edit `js/app.js` in the `fmt.currency()` function to change from ₹ to another symbol:
```javascript
currency: (n) => '$' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
```

### Modify Dashboard Chart
Edit `js/dashboard.js` to change:
- Number of expense categories shown (line with `.slice(0,6)`)
- Chart colors (DONUT_COLORS array)
- Number of recent transactions shown

---

## Need Help?
Check the browser console (F12) for error messages, or verify:
1. Server is running: `npm start`
2. MySQL is running and accessible
3. Database tables are created using `database.sql`
