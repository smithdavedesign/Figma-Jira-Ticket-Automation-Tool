import dotenv from 'dotenv';

// Fix API Key Environment Variable Issue
// Unset invalid system environment variable before loading .env
if (process.env.GEMINI_API_KEY === 'AIzaSyCWGu1CMfzSVlg_04QbWUH6TNSxS_t39Ck') {
  console.log('🔧 Removing invalid system GEMINI_API_KEY override...');
  delete process.env.GEMINI_API_KEY;
}

// Load environment variables
dotenv.config();
