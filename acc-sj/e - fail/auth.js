// Authentication utility functions

/**
 * Configuration constants
 */
const AUTH_CONFIG = {
  API_ENDPOINT: 'https://app.weva.my.id/api/vrv-usr',
  STORAGE_KEYS: {
    IS_LOGGED_IN: 'isLoggedIn',
    USERNAME: 'username',
    USER_DATA: 'userData'
  },
  REDIRECT_DELAY: 1000
};

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

/**
 * Get current username
 */
function getCurrentUsername() {
  return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USERNAME) || '';
}

/**
 * Get current user data
 */
function getCurrentUserData() {
  const userData = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Logout function with cleanup
 */
function logout() {
  // Clear all authentication data
  Object.values(AUTH_CONFIG.STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear any session data
  sessionStorage.clear();
  
  window.location.href = './login';
}

/**
 * Verify user credentials with API
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} Authentication result
 */
async function verifyCredentials(username, password) {
  try {
    const response = await fetch(AUTH_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ usr: username })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data && result.data.length > 0) {
      const userData = result.data[0];
      
      const isPasswordValid = await verifyPassword(password, userData.pwd);
      
      if (isPasswordValid) {
        return {
          success: true,
          userData: userData,
          message: 'Login berhasil'
        };
      } else {
        return {
          success: false,
          message: 'Password tidak valid',
          code: 'INVALID_PASSWORD'
        };
      }
    } else {
      return {
        success: false,
        message: 'Username tidak ditemukan',
        code: 'USER_NOT_FOUND'
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        code: 'NETWORK_ERROR'
      };
    }
    
    return {
      success: false,
      message: 'Terjadi kesalahan sistem. Silakan coba lagi.',
      code: 'SYSTEM_ERROR'
    };
  }
}

/**
 * Password verification function
 * @param {string} inputPassword - Password entered by user
 * @param {string} storedPasswordHash - Stored password hash
 * @returns {Promise<boolean>} Whether password is valid
 */
async function verifyPassword(inputPassword, storedPasswordHash) {
  try {
    // Handle empty or null passwords
    if (!inputPassword || !storedPasswordHash) {
      return false;
    }
    
    // Simple SHA-256 hash comparison
    const encoder = new TextEncoder();
    const data = encoder.encode(inputPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === storedPasswordHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Main login function
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} Login result
 */
async function loginUser(username, password) {
  // Input validation
  if (!username || !password) {
    return {
      success: false,
      message: 'Username dan password harus diisi',
      code: 'MISSING_CREDENTIALS'
    };
  }
  
  const result = await verifyCredentials(username, password);
  
  if (result.success) {
    // Store authentication data securely
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USERNAME, username);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(result.userData));
    
    // Store login timestamp for session management
    localStorage.setItem('loginTimestamp', Date.now().toString());
    
    return { 
      success: true, 
      message: result.message,
      userData: result.userData 
    };
  } else {
    return { 
      success: false, 
      message: result.message,
      code: result.code 
    };
  }
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = './login';
    return false;
  }
  return true;
}

/**
 * Initialize authentication for protected pages
 */
function initAuth() {
  if (!requireAuth()) {
    return false;
  }
  
  // Setup logout functionality with confirmation
  const offButton = document.getElementById('offButton');
  if (offButton) {
    offButton.addEventListener('click', (e) => {
      e.preventDefault();
      showLogoutConfirmation();
    });
  }
  
  // Check session validity (optional: implement session timeout)
  checkSessionValidity();
  
  return true;
}
/**
/**
 * Show logout confirmation dialog
 */
function showLogoutConfirmation() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="bi bi-box-arrow-right text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Konfirmasi Keluar</h3>
        <p class="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari sistem?</p>
        <div class="flex space-x-3">
          <button id="cancelLogout" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl transition-colors duration-200">
            Batal
          </button>
          <button id="confirmLogout" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl transition-colors duration-200">
            Keluar
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Setup event listeners
  modal.querySelector('#cancelLogout').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#confirmLogout').addEventListener('click', () => {
    modal.remove();
    logout();
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}
 * Check if session is still valid (optional session timeout)
 */
function checkSessionValidity() {
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  if (loginTimestamp) {
    const sessionDuration = Date.now() - parseInt(loginTimestamp);
    const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionDuration > maxSessionDuration) {
      console.log('Session expired, logging out...');
      logout();
    }
  }
}
/**
 * Get user session information
 */
function getUserSessionInfo() {
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  if (loginTimestamp) {
    const loginTime = new Date(parseInt(loginTimestamp));
    const sessionDuration = Date.now() - parseInt(loginTimestamp);
    const hours = Math.floor(sessionDuration / (1000 * 60 * 60));
    const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      loginTime,
      duration: `${hours}j ${minutes}m`,
      isActive: sessionDuration < 24 * 60 * 60 * 1000 // 24 hours
    };
  }
  return null;
}

/**
 * Get user role and permissions
 */
function getUserRole() {
  const userData = getCurrentUserData();
  return userData?.role || 'user';
}

/**
 * Get user full name with fallback
 */
function getUserDisplayName() {
  const userData = getCurrentUserData();
  const username = getCurrentUsername();
  
  if (userData?.nama) {
    return userData.nama;
  }
  
  // Create display name from username
  if (username) {
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  
  return 'User';
}

/**
 * Get user initials for avatar
 */
function getUserInitials() {
  const displayName = getUserDisplayName();
  const words = displayName.split(' ');
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return displayName.substring(0, 2).toUpperCase();
}