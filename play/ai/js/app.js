// Supabase Configuration
const SUPABASE_URL = 'https://ipuyyuiljeegdunjgcup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwdXl5dWlsamVlZ2R1bmpnY3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTAxMTIsImV4cCI6MjA2NjY2NjExMn0.LiJ3v8Pb4vgmrOTgzDqA-YXoysC5fZ6MULab_6kYE_Y';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
let currentUser = null;
let currentSessionId = null;
let userApiKey = null;
let sessions = [];
let messages = [];

// Utility Functions
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function showLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';
    } else {
        button.disabled = false;
        // Reset button content based on button type
        if (buttonId === 'loginButton') {
            button.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path>
                </svg>
                Masuk
            `;
        } else if (buttonId === 'registerButton') {
            button.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Daftar
            `;
        }
    }
}

// Authentication Functions
function login(email, password) {
    return supabase
        .from('users')
        .select('id, email, password_hash, created_at, user_id, name, full_name')
        .eq('email', email)
        .single()
        .then(({ data, error }) => {
            if (error || !data || !data.password_hash) {
                return false;
            }

            const isValid = bcrypt.compareSync(password, data.password_hash);
            if (isValid) {
                currentUser = data;
                localStorage.setItem('currentUser', JSON.stringify(data));
                return true;
            }
            return false;
        })
        .catch(error => {
            console.error('Login error:', error);
            return false;
        });
}

function register(email, password) {
    try {
        const hashedPassword = bcrypt.hashSync(password, 12);

        return supabase
            .from('users')
            .insert([{ 
                id: generateUUID(),
                email, 
                password_hash: hashedPassword,
                user_id: generateUUID(),
                token_identifier: generateUUID()
            }])
            .select()
            .single()
            .then(({ data, error }) => {
                if (error || !data) return false;

                currentUser = data;
                localStorage.setItem('currentUser', JSON.stringify(data));
                return true;
            })
            .catch(error => {
                console.error('Registration error:', error);
                return false;
            });
    } catch (error) {
        console.error('Hashing error:', error);
        return false;
    }
}


function logout() {
    currentUser = null;
    currentSessionId = null;
    userApiKey = null;
    sessions = [];
    messages = [];
    localStorage.removeItem('currentUser');
    showAuthPage();
}

// API Key Functions
async function fetchUserApiKey() {
    if (!currentUser) return;

    const { data } = await supabase
        .from('apis')
        .select('*')
        .eq('user_id', currentUser.id)
        .limit(1);

    if (data && data[0]) {
        userApiKey = data[0];
        document.getElementById('apiKeyCount').textContent = `API Keys: ${data.length}`;
        return data[0];
    }
    return null;
}

async function saveApiKey(apiKey, model) {
    if (!currentUser || !apiKey) return false;

    try {
        if (userApiKey) {
            await supabase
                .from('apis')
                .update({ api_key: apiKey, model })
                .eq('user_id', currentUser.id);
        } else {
            await supabase
                .from('apis')
                .insert([{ user_id: currentUser.id, api_key: apiKey, model }]);
        }

        await fetchUserApiKey();
        return true;
    } catch (error) {
        console.error('Error saving API key:', error);
        return false;
    }
}

// Session Functions
async function fetchSessions() {
    if (!currentUser) return;

    const { data } = await supabase
        .from('chats')
        .select('session_id, message, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (data) {
        const sessionMap = new Map();
        
        data.forEach((chat) => {
            if (!sessionMap.has(chat.session_id)) {
                sessionMap.set(chat.session_id, {
                    id: chat.session_id,
                    title: chat.message.substring(0, 30) + (chat.message.length > 30 ? '...' : ''),
                    lastMessage: chat.message.substring(0, 50) + (chat.message.length > 50 ? '...' : '')
                });
            }
        });

        sessions = Array.from(sessionMap.values());
        renderSessions();
    }
}

function renderSessions() {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';

    sessions.forEach(session => {
        const sessionElement = document.createElement('button');
        sessionElement.className = `w-full text-left p-3 rounded-lg transition duration-200 ${
            currentSessionId === session.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`;
        sessionElement.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-medium truncate">${session.title}</p>
                    <p class="text-xs opacity-75 truncate">${session.lastMessage}</p>
                </div>
            </div>
        `;
        sessionElement.onclick = () => selectSession(session.id);
        sessionsList.appendChild(sessionElement);
    });
}

function selectSession(sessionId) {
    currentSessionId = sessionId;
    renderSessions();
    fetchMessages();
    showChatArea();
}

function createNewSession() {
    currentSessionId = generateUUID();
    messages = [];
    renderSessions();
    showChatArea();
}

// Message Functions
async function fetchMessages() {
    if (!currentSessionId || !currentUser) return;

    const { data } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });

    if (data) {
        messages = data;
        renderMessages();
    }
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach(message => {
        // User message
        const userDiv = document.createElement('div');
        userDiv.className = 'flex items-start justify-end message-bubble';
        userDiv.innerHTML = `
            <div class="bg-blue-600 text-white p-4 rounded-lg max-w-2xl">
                <div class="flex items-center mb-2">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-sm font-medium">Anda</span>
                </div>
                <p class="whitespace-pre-wrap">${message.message}</p>
            </div>
        `;
        container.appendChild(userDiv);

        // AI response
        if (message.ai_response) {
            const aiDiv = document.createElement('div');
            aiDiv.className = 'flex items-start message-bubble';
            aiDiv.innerHTML = `
                <div class="bg-gray-800 text-white p-4 rounded-lg max-w-2xl border border-gray-700">
                    <div class="flex items-center mb-2">
                        <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-sm font-medium">Gemini AI</span>
                    </div>
                    <p class="whitespace-pre-wrap">${message.ai_response}</p>
                </div>
            `;
            container.appendChild(aiDiv);
        }
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('messagesContainer');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'flex items-start';
    typingDiv.innerHTML = `
        <div class="bg-gray-800 text-white p-4 rounded-lg border border-gray-700">
            <div class="flex items-center mb-2">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium">Gemini AI</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <span class="text-gray-400 text-sm ml-2">Mengetik...</span>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage(messageText) {
    if (!messageText.trim() || !currentSessionId || !currentUser || !userApiKey) return;

    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    
    sendButton.disabled = true;
    messageInput.disabled = true;

    // Add user message to UI
    const tempMessage = {
        id: `temp-${Date.now()}`,
        user_id: currentUser.id,
        session_id: currentSessionId,
        message: messageText,
        ai_response: null,
        created_at: new Date().toISOString()
    };
    messages.push(tempMessage);
    renderMessages();
    showTypingIndicator();

    try {
        // Call Gemini API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${userApiKey.model}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': userApiKey.api_key
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: messageText
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak ada respons dari AI.';

        // Save to database
        const { data: savedChat, error } = await supabase
            .from('chats')
            .insert([{
                user_id: currentUser.id,
                session_id: currentSessionId,
                message: messageText,
                ai_response: aiResponse
            }])
            .select()
            .single();

        if (error) throw error;

        // Update messages
        messages = messages.filter(msg => msg.id !== tempMessage.id);
        messages.push(savedChat);
        
        hideTypingIndicator();
        renderMessages();
        
        // Update sessions list
        await fetchSessions();

    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();
        messages = messages.filter(msg => msg.id !== tempMessage.id);
        renderMessages();
        alert('Terjadi kesalahan saat mengirim pesan. Pastikan API key valid.');
    } finally {
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.value = '';
    }
}

// UI Functions
function showAuthPage() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Fetch user data
    fetchUserApiKey();
    fetchSessions();
    
    // Show appropriate screen
    if (!userApiKey) {
        showNoApiKeyScreen();
    } else if (!currentSessionId) {
        showWelcomeScreen();
    } else {
        showChatArea();
    }
}

function showWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('noApiKeyScreen').classList.add('hidden');
    document.getElementById('chatArea').classList.add('hidden');
}

function showNoApiKeyScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('noApiKeyScreen').classList.remove('hidden');
    document.getElementById('chatArea').classList.add('hidden');
}

function showChatArea() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('noApiKeyScreen').classList.add('hidden');
    document.getElementById('chatArea').classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showAuthPage();
    }

    // Auth toggle
    document.getElementById('toggleAuth').addEventListener('click', function() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleText = document.getElementById('toggleAuthText');
        
        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            toggleText.innerHTML = 'Belum punya akun? <span class="font-medium">Daftar di sini</span>';
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            toggleText.innerHTML = 'Sudah punya akun? <span class="font-medium">Masuk di sini</span>';
        }
    });

    // Login form
    document.getElementById('loginFormElement').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        showLoading('loginButton', true);
        
        const success = await login(email, password);
        
        if (success) {
            showDashboard();
        } else {
            showError('Email atau password tidak valid');
        }
        
        showLoading('loginButton', false);
    });

    // Register form
    document.getElementById('registerFormElement').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('Password tidak cocok');
            return;
        }
        
        if (password.length < 6) {
            showError('Password minimal 6 karakter');
            return;
        }
        
        showLoading('registerButton', true);
        
        const success = await register(email, password);
        
        if (success) {
            showDashboard();
        } else {
            showError('Email sudah terdaftar atau terjadi kesalahan');
        }
        
        showLoading('registerButton', false);
    });

    // Password toggle
    document.getElementById('toggleLoginPassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // Dashboard events
    document.getElementById('newChatButton').addEventListener('click', createNewSession);
    document.getElementById('logoutButton').addEventListener('click', logout);

    // Settings modal
    document.getElementById('settingsButton').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.remove('hidden');
        if (userApiKey) {
            document.getElementById('apiKeyInput').value = userApiKey.api_key;
            document.getElementById('modelSelect').value = userApiKey.model;
        }
    });

    document.getElementById('closeSettingsButton').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('cancelSettingsButton').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('saveSettingsButton').addEventListener('click', async function() {
        const apiKey = document.getElementById('apiKeyInput').value;
        const model = document.getElementById('modelSelect').value;
        
        if (!apiKey) return;
        
        const button = document.getElementById('saveSettingsButton');
        button.disabled = true;
        button.textContent = 'Menyimpan...';
        
        const success = await saveApiKey(apiKey, model);
        
        if (success) {
            document.getElementById('settingsModal').classList.add('hidden');
            if (!currentSessionId) {
                showWelcomeScreen();
            }
        } else {
            alert('Gagal menyimpan API key');
        }
        
        button.disabled = false;
        button.textContent = 'Simpan';
    });

    // Message sending
    document.getElementById('sendButton').addEventListener('click', function() {
        const messageText = document.getElementById('messageInput').value;
        if (messageText.trim()) {
            sendMessage(messageText);
        }
    });

    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const messageText = this.value;
            if (messageText.trim()) {
                sendMessage(messageText);
            }
        }
    });
});