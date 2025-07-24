// form-templates.js
const templates = {
  loginForm: `
    <h2 id="form-title" class="text-2xl font-bold text-center mb-4">Login to Your Account</h2>

    <!-- Tabs -->
    <div class="flex justify-center space-x-4 mb-6">
      <button id="login-tab" class="font-medium text-blue-600 border-b-2 border-blue-600 pb-2 px-4">Login</button>
      <button id="register-tab" class="font-medium text-gray-500 hover:text-blue-600 border-b-2 border-transparent pb-2 px-4">Register</button>
    </div>

    <!-- Login Form -->
    <form id="login-form" class="space-y-4 hidden">
      <div>
        <label for="email-login" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email-login" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <div>
        <label for="password-login" class="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password-login" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
        Login
      </button>
    </form>`,
    
  registerForm: `
    <!-- Register Form -->
    <form id="register-form" class="space-y-4">
      <div>
        <label for="name-register" class="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name-register" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <div>
        <label for="email-register" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email-register" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <div>
        <label for="password-register" class="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password-register" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
        Register
      </button>
    </form>`
};

export default templates;