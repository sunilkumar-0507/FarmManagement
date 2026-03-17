/* ========================================
   LOGIN PAGE - JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { auth } = window.FMS;

  // If already logged in, redirect to dashboard
  if (auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Demo user for testing (hardcoded)
  const DEMO_USER = {
    email: 'demo@farm.com',
    password: 'Demo@123',
    id: 999,
    fullName: 'Demo User',
    role: 'owner'
  };

  const form       = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  const errBox     = document.getElementById('login-error');
  const btnText    = document.getElementById('btn-text');
  const spinner    = document.getElementById('btn-spinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    // Validation
    let hasError = false;
    if (!email) { showFieldError('email-error', 'Email is required'); hasError = true; }
    if (!password) { showFieldError('pass-error', 'Password is required'); hasError = true; }
    if (hasError) return;

    // Show loading
    btnText.textContent = 'Signing in…';
    spinner.classList.remove('hidden');

    try {
      // Check for demo user first
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const user = {
          id: DEMO_USER.id,
          fullName: DEMO_USER.fullName,
          email: DEMO_USER.email,
          role: DEMO_USER.role
        };
        auth.setSession(user);
        window.location.href = 'dashboard.html';
        return;
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        // Map database fields to app format
        const user = {
          id: data.user.id,
          fullName: data.user.name || 'User',
          email: data.user.email,
          role: data.user.role
        };
        auth.setSession(user);
        window.location.href = 'dashboard.html';
      } else {
        btnText.textContent = 'Sign In';
        spinner.classList.add('hidden');
        errBox.classList.remove('hidden');
        errBox.textContent = '❌ Invalid email or password. Please try again.';
        passInput.value = '';
        passInput.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      btnText.textContent = 'Sign In';
      spinner.classList.add('hidden');
      errBox.classList.remove('hidden');
      errBox.textContent = '❌ Connection error. Please try again.';
      passInput.value = '';
      passInput.focus();
    }
  });

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  }

  function clearErrors() {
    errBox.classList.add('hidden');
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  }

  // Password toggle
  const togglePass = document.getElementById('toggle-password');
  if (togglePass) {
    togglePass.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        togglePass.textContent = '🙈';
      } else {
        passInput.type = 'password';
        togglePass.textContent = '👁';
      }
    });
  }
});
