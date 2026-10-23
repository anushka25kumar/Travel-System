/**
 * TravelSmart Auth & Session State Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbarAuthState();

  // Handle Login Form if present
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const alertBox = document.getElementById('authAlert');

      try {
        alertBox.style.display = 'none';
        const user = await window.api.login(email, password);
        if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/search.html';
        }
      } catch (err) {
        alertBox.textContent = err.message || 'Login failed. Please check credentials.';
        alertBox.style.display = 'block';
      }
    });
  }

  // Handle Register Form if present
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const role = document.getElementById('regRole') ? document.getElementById('regRole').value : 'ROLE_USER';
      const alertBox = document.getElementById('authAlert');

      try {
        alertBox.style.display = 'none';
        await window.api.register(fullName, email, phone, password, role);
        window.location.href = '/search.html';
      } catch (err) {
        alertBox.textContent = err.message || 'Registration failed.';
        alertBox.style.display = 'block';
      }
    });
  }
});

function renderNavbarAuthState() {
  const user = window.api.getCurrentUser();
  const authContainer = document.getElementById('navbarAuthArea');
  const adminNavBtn = document.getElementById('adminNavBtn');
  const bookingsBadge = document.getElementById('bookingsCountBadge');

  if (adminNavBtn) {
    adminNavBtn.style.display = (user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN')) ? 'flex' : 'none';
  }

  if (bookingsBadge) {
    window.api.getMyBookings()
      .then(b => {
        if (b && b.length > 0) {
          bookingsBadge.textContent = b.length;
          bookingsBadge.style.display = 'inline-block';
        } else {
          bookingsBadge.style.display = 'none';
        }
      })
      .catch(() => {});
  }

  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 13px; font-weight: 700; color: #10224D;">${user.fullName || user.email}</span>
        <button onclick="window.api.logout()" class="btn-auth btn-auth-primary" style="padding: 6px 12px; font-size: 12px; background: #EF4444; border-color: #EF4444;">
          Logout
        </button>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="/login.html" class="btn-auth btn-auth-primary">
        Sign In
      </a>
    `;
  }
}
