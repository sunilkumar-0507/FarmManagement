# Connect MySQL with Your Farm Management System

## Step-by-Step Setup Guide

### 1. **Install Node.js**
   - Download from https://nodejs.org/ (LTS version recommended)
   - Verify installation: `node --version` and `npm --version`

### 2. **Setup Database in MySQL Workbench**
   - Open MySQL Workbench
   - Create a new query tab
   - Open and run the `database.sql` file
   - This creates the database and tables with sample data

### 3. **Configure Database Connection**
   - Open `.env` file in your project
   - Update these values:
     ```
     DB_HOST=localhost          # Your MySQL host
     DB_USER=root              # Your MySQL username
     DB_PASSWORD=              # Your MySQL password (if any)
     DB_NAME=farm_db           # Database name
     ```

### 4. **Install Dependencies**
   - Open terminal/command prompt in the project folder
   - Run: `npm install`
   - This installs Express, MySQL driver, and other dependencies

### 5. **Start the Server**
   - Run: `npm start`
   - You should see: "✓ MySQL connected successfully"
   - Server will run at http://localhost:3000

### 6. **Update Frontend to Use API**
   - Your frontend HTML files will automatically be served from `http://localhost:3000`
   - Login and register requests now connect to your MySQL database
   - The `login.js` will handle API calls to `/api/login`

## File Structure After Setup
```
FarmMS/
├── server.js              # Express backend server
├── package.json           # Node dependencies
├── .env                   # Database credentials
├── database.sql           # Database schema
├── index.html
├── dashboard.html
├── register.html
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── login.js (needs update)
    └── ...
```

## Important Notes

- **Password Hashing**: Currently passwords are stored plain text. Add bcrypt for security.
- **Environment Variables**: Keep `.env` file private, don't share it
- **CORS**: Already enabled for local development
- **API Endpoints**: 
  - `POST /api/login` - User login
  - `POST /api/register` - New user registration
  - `GET /api/dashboard` - Dashboard data

## Troubleshooting

**Connection fails**: Check if MySQL service is running
**Module not found**: Run `npm install` again
**Port already in use**: Change PORT in `.env` file

