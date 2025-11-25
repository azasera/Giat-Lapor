// Contoh cara load credentials dari file JSON
// Tambahkan di googleConfig.ts atau buat utility terpisah

import clientSecret from '../client_secret_1.json';

// Extract credentials dari file JSON
const credentials = clientSecret.web;

export const GOOGLE_CONFIG = {
  clientId: credentials.client_id,
  clientSecret: credentials.client_secret,
  projectId: credentials.project_id,
  authUri: credentials.auth_uri,
  tokenUri: credentials.token_uri,
  
  // API key tetap perlu dari Google Cloud Console
  apiKey: "AIzaSy_YOUR_ACTUAL_API_KEY_HERE",
  
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
  ],
  scopes: [
    "https://www.googleapis.com/auth/drive.file", 
    "https://www.googleapis.com/auth/spreadsheets"
  ]
};