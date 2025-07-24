// script.js
import templates from './form-templates.js';

$(document).ready(function() {
  // Initialize app with login form
  initializeApp('login');
});

function initializeApp(formType) {
  $('#app').empty();
  $('#app').append(templates.loginForm);
  $('#app').append(templates.registerForm);
  
  if (formType === 'login') {
    showLoginForm();
  } else {
    showRegisterForm();
  }
}

function showLoginForm() {
  $('#login-tab')
    .addClass('text-blue-600 border-blue-600')
    .removeClass('text-gray-500 border-transparent');
  
  $('#register-tab')
    .addClass('text-gray-500 border-transparent')
    .removeClass('text-blue-600 border-blue-600');
  
  $('#login-form').removeClass('hidden');
  $('#register-form').addClass('hidden');
  $('#form-title').text("Login to Your Account");
}

function showRegisterForm() {
  $('#register-tab')
    .addClass('text-blue-600 border-blue-600')
    .removeClass('text-gray-500 border-transparent');
  
  $('#login-tab')
    .addClass('text-gray-500 border-transparent')
    .removeClass('text-blue-600 border-blue-600');
  
  $('#register-form').removeClass('hidden');
  $('#login-form').addClass('hidden');
  $('#form-title').text("Create a New Account");
}

// Event handlers
$('#login-tab').on('click', function() {
  showLoginForm();
});

$('#register-tab').on('click', function() {
  showRegisterForm();
});