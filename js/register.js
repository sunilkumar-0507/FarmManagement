/* ========================================
   REGISTER PAGE - JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const { auth } = window.FMS;

  if (auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form         = document.getElementById('register-form');
  const nameInput    = document.getElementById('reg-name');
  const emailInput   = document.getElementById('reg-email');
  const passInput    = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm');
  const btnText      = document.getElementById('btn-text');
  const spinner      = document.getElementById('btn-spinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const fullName = nameInput.value.trim();
    const email    = emailInput.value.trim().toLowerCase();
    const password = passInput.value;
    const confirm  = confirmInput.value;
    const role     = document.querySelector('input[name="role"]:checked')?.value || 'FarmWorker';

    // Validation
    let hasError = false;

    if (!fullName) { showFieldError('name-error', 'Full name is required'); hasError = true; }
    if (!email || !email.includes('@')) { showFieldError('email-error', 'Valid email is required'); hasError = true; }
    if (!password || password.length < 6) { showFieldError('pass-error', 'Password must be at least 6 characters'); hasError = true; }
    if (password !== confirm) { showFieldError('confirm-error', 'Passwords do not match'); hasError = true; }
    if (hasError) return;

    // Loading state
    btnText.textContent = 'Creating account…';
    spinner.classList.remove('hidden');

    try {
      console.log('Attempting to register with:', { email, name: fullName });
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Map database fields to app format
        const newUser = {
          id: data.userId,
          fullName: fullName,
          email: email,
          role: role
        };
        auth.setSession(newUser);
        window.location.href = 'dashboard.html';
      } else {
        btnText.textContent = 'Create Account';
        spinner.classList.add('hidden');
        showFieldError('email-error', data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error details:', error.message);
      btnText.textContent = 'Create Account';
      spinner.classList.add('hidden');
      showFieldError('email-error', `Error: ${error.message || 'Connection error'}. Make sure server is running on http://localhost:3000`);
    }
  });

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('show'); }
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  }

  // Password toggles
  ['toggle-password', 'toggle-confirm'].forEach(id => {
    const btn = document.getElementById(id);
    const inp = id === 'toggle-password' ? passInput : confirmInput;
    if (btn) {
      btn.addEventListener('click', () => {
        inp.type = inp.type === 'password' ? 'text' : 'password';
        btn.textContent = inp.type === 'password' ? '👁' : '🙈';
      });
    }
  });
});
