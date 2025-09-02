/**
 * Login Page Controller
 * Handles all login-related functionality with clean separation of concerns
 */

class LoginController {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      isLoading: false,
      isPasswordVisible: false
    };
    
    this.init();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    return {
      form: document.getElementById('loginForm'),
      username: document.getElementById('username'),
      password: document.getElementById('password'),
      togglePassword: document.getElementById('togglePassword'),
      eyeIcon: document.getElementById('eyeIcon'),
      loginButton: document.getElementById('loginButton'),
      loginButtonText: document.getElementById('loginButtonText'),
      loginButtonLoading: document.getElementById('loginButtonLoading'),
      errorAlert: document.getElementById('errorAlert'),
      successAlert: document.getElementById('successAlert'),
      errorText: document.getElementById('errorText'),
      successText: document.getElementById('successText'),
      closeError: document.getElementById('closeError'),
      usernameError: document.getElementById('usernameError'),
      passwordError: document.getElementById('passwordError')
    };
  }

  /**
   * Initialize the login controller
   */
  init() {
    this.checkExistingAuth();
    this.setupEventListeners();
    this.setupFormValidation();
    this.focusUsernameInput();
  }

  /**
   * Check if user is already authenticated
   */
  checkExistingAuth() {
    if (isAuthenticated()) {
      this.redirectToMain();
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Form submission
    this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    
    // Password toggle
    this.elements.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
    
    // Close error alert
    this.elements.closeError.addEventListener('click', () => this.hideAlerts());
    
    // Input validation on blur
    this.elements.username.addEventListener('blur', () => this.validateUsername());
    this.elements.password.addEventListener('blur', () => this.validatePassword());
    
    // Clear validation errors on input
    this.elements.username.addEventListener('input', () => this.clearFieldError('username'));
    this.elements.password.addEventListener('input', () => this.clearFieldError('password'));
    
    // Enter key handling
    this.elements.username.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.elements.password.focus();
      }
    });
  }

  /**
   * Setup real-time form validation
   */
  setupFormValidation() {
    // Add input event listeners for real-time feedback
    this.elements.username.addEventListener('input', () => {
      if (this.elements.username.value.trim()) {
        this.elements.username.classList.remove('border-red-300');
        this.elements.username.classList.add('border-green-300');
      }
    });

    this.elements.password.addEventListener('input', () => {
      if (this.elements.password.value) {
        this.elements.password.classList.remove('border-red-300');
        this.elements.password.classList.add('border-green-300');
      }
    });
  }

  /**
   * Focus on username input
   */
  focusUsernameInput() {
    setTimeout(() => {
      this.elements.username.focus();
    }, 100);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    this.state.isPasswordVisible = !this.state.isPasswordVisible;
    
    const type = this.state.isPasswordVisible ? 'text' : 'password';
    const iconClass = this.state.isPasswordVisible ? 'bi bi-eye-slash' : 'bi bi-eye';
    
    this.elements.password.setAttribute('type', type);
    this.elements.eyeIcon.className = iconClass;
    
    // Add visual feedback
    this.elements.togglePassword.classList.add('scale-110');
    setTimeout(() => {
      this.elements.togglePassword.classList.remove('scale-110');
    }, 150);
  }

  /**
   * Validate username field
   */
  validateUsername() {
    const username = this.elements.username.value.trim();
    
    if (!username) {
      this.showFieldError('username', 'Username tidak boleh kosong');
      return false;
    }
    
    if (username.length < 3) {
      this.showFieldError('username', 'Username minimal 3 karakter');
      return false;
    }
    
    this.clearFieldError('username');
    return true;
  }

  /**
   * Validate password field
   */
  validatePassword() {
    const password = this.elements.password.value;
    
    if (!password) {
      this.showFieldError('password', 'Password tidak boleh kosong');
      return false;
    }
    
    if (password.length < 4) {
      this.showFieldError('password', 'Password minimal 4 karakter');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  /**
   * Show field-specific error
   */
  showFieldError(field, message) {
    const errorElement = this.elements[`${field}Error`];
    const inputElement = this.elements[field];
    
    if (errorElement) {
      errorElement.querySelector('span').textContent = message;
      errorElement.classList.remove('hidden');
      inputElement.classList.add('border-red-300', 'bg-red-50/50');
      inputElement.classList.remove('border-green-300');
    }
  }

  /**
   * Clear field-specific error
   */
  clearFieldError(field) {
    const errorElement = this.elements[`${field}Error`];
    const inputElement = this.elements[field];
    
    if (errorElement) {
      errorElement.classList.add('hidden');
      inputElement.classList.remove('border-red-300', 'bg-red-50/50');
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    const isUsernameValid = this.validateUsername();
    const isPasswordValid = this.validatePassword();
    
    return isUsernameValid && isPasswordValid;
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (this.state.isLoading) {
      return;
    }
    
    // Validate form
    if (!this.validateForm()) {
      this.showError('Mohon perbaiki kesalahan pada form');
      return;
    }
    
    const credentials = this.getFormData();
    await this.performLogin(credentials);
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      username: this.elements.username.value.trim(),
      password: this.elements.password.value
    };
  }

  /**
   * Perform login process
   */
  async performLogin(credentials) {
    try {
      this.setLoadingState(true);
      this.hideAlerts();
      
      const result = await loginUser(credentials.username, credentials.password);
      
      if (result.success) {
        await this.handleLoginSuccess();
      } else {
        this.handleLoginError(result.message);
      }
    } catch (error) {
      console.error('Login process error:', error);
      this.handleLoginError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Handle successful login
   */
  async handleLoginSuccess() {
    this.showSuccess('Login berhasil! Mengalihkan ke dashboard...');
    
    // Update button to show success state
    this.elements.loginButtonLoading.innerHTML = `
      <i class="bi bi-check-circle-fill mr-2 text-green-400"></i>
      Berhasil masuk...
    `;
    
    // Add success animation to form
    this.elements.form.classList.add('animate-pulse-slow');
    
    // Redirect after delay
    setTimeout(() => {
      this.redirectToMain();
    }, 1500);
  }

  /**
   * Handle login error
   */
  handleLoginError(message) {
    const errorMessages = {
      'tidak ditemukan': 'Username tidak terdaftar dalam sistem',
      'tidak valid': 'Password yang Anda masukkan salah',
      'Password tidak valid': 'Password yang Anda masukkan salah'
    };
    
    // Find matching error message or use default
    const displayMessage = Object.keys(errorMessages).find(key => 
      message.toLowerCase().includes(key.toLowerCase())
    );
    
    const finalMessage = displayMessage ? errorMessages[displayMessage] : message;
    this.showError(finalMessage);
    
    // Add shake animation to form
    this.elements.form.classList.add('animate-pulse');
    setTimeout(() => {
      this.elements.form.classList.remove('animate-pulse');
    }, 500);
    
    // Focus back to username if it's a username error
    if (finalMessage.includes('Username')) {
      this.elements.username.focus();
      this.elements.username.select();
    } else {
      this.elements.password.focus();
      this.elements.password.select();
    }
  }

  /**
   * Set loading state
   */
  setLoadingState(isLoading) {
    this.state.isLoading = isLoading;
    this.elements.loginButton.disabled = isLoading;
    
    if (isLoading) {
      this.elements.loginButtonText.classList.add('hidden');
      this.elements.loginButtonLoading.classList.remove('hidden');
      this.elements.loginButton.classList.add('cursor-not-allowed');
    } else {
      this.elements.loginButtonText.classList.remove('hidden');
      this.elements.loginButtonLoading.classList.add('hidden');
      this.elements.loginButton.classList.remove('cursor-not-allowed');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.hideAlerts();
    this.elements.errorText.textContent = message;
    this.elements.errorAlert.classList.remove('hidden');
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      this.hideAlerts();
    }, 8000);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.hideAlerts();
    this.elements.successText.textContent = message;
    this.elements.successAlert.classList.remove('hidden');
  }

  /**
   * Hide all alert messages
   */
  hideAlerts() {
    this.elements.errorAlert.classList.add('hidden');
    this.elements.successAlert.classList.add('hidden');
  }

  /**
   * Redirect to main application
   */
  redirectToMain() {
    window.location.href = '../';
  }
}

/**
 * Utility functions for enhanced user experience
 */
class LoginUtils {
  /**
   * Add keyboard shortcuts
   */
  static setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape key to clear alerts
      if (e.key === 'Escape') {
        const controller = window.loginController;
        if (controller) {
          controller.hideAlerts();
        }
      }
    });
  }

  /**
   * Setup form auto-save (remember username)
   */
  static setupAutoSave() {
    const usernameInput = document.getElementById('username');
    
    // Load saved username
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      usernameInput.value = savedUsername;
    }
    
    // Save username on input
    usernameInput.addEventListener('input', () => {
      const username = usernameInput.value.trim();
      if (username) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
    });
  }

  /**
   * Add visual enhancements
   */
  static setupVisualEnhancements() {
    // Add focus ring animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('ring-2', 'ring-blue-200');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('ring-2', 'ring-blue-200');
      });
    });
  }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize login controller
  window.loginController = new LoginController();
  
  // Setup additional utilities
  LoginUtils.setupKeyboardShortcuts();
  LoginUtils.setupAutoSave();
  LoginUtils.setupVisualEnhancements();
  
  // Add loading animation to page
  document.body.classList.add('animate-fade-in');
});

/**
 * Handle page visibility changes for security
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Re-check auth when page becomes visible
    if (isAuthenticated()) {
      window.location.href = '../';
    }
  }
});

/**
 * Prevent form submission on Enter in password field if validation fails
 */
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.target.type === 'password') {
    const controller = window.loginController;
    if (controller && !controller.validateForm()) {
      e.preventDefault();
    }
  }
});