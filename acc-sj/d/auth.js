// Authentication utility functions

// Check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current username
function getCurrentUsername() {
  return localStorage.getItem('username') || '';
}

// Logout function
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  window.location.href = './login';
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = './login';
    return false;
  }
  return true;
}

// Initialize auth check for protected pages
function initAuth() {
  // Check authentication on page load
  if (!requireAuth()) {
    return false;
  }
  
  // Setup logout functionality for off button
  const offButton = document.getElementById('offButton');
  if (offButton) {
    offButton.addEventListener('click', logout);
  }
  
  return true;
}