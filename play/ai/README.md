# Gemini AI Chat - Static Version

Aplikasi chat AI dengan Google Gemini yang terhubung langsung ke Supabase tanpa konfigurasi backend.

## Features
- ✅ Autentikasi custom dengan password hash
- ✅ Manajemen API key Google Gemini
- ✅ Chat history dengan session management
- ✅ Vector embeddings (Supabase.ai)
- ✅ Interface modern dan responsive
- ✅ Hardcoded Supabase connection

## Setup
1. Clone repository ini
2. Jalankan `npm install`
3. Jalankan `npm run dev`
4. Buka browser di `http://localhost:5173`

## Cara Penggunaan
1. **Register**: Buat akun baru dengan email dan password
2. **Login**: Masuk dengan kredensial yang sudah dibuat
3. **API Key**: Masukkan Google Gemini API key di pengaturan (ikon gear)
4. **Chat**: Buat session baru dan mulai chat dengan AI

## API Key Google Gemini
Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)

## Database
Aplikasi ini terhubung ke Supabase instance yang sudah dikonfigurasi:
- URL: https://ipuyyuiljeegdunjgcup.supabase.co
- Tables: users, apis, chats
- Edge functions: chat-with-gemini

## Tech Stack
- React + TypeScript
- Tailwind CSS
- Supabase (via CDN)
- Google Gemini AI API
- Lucide React Icons