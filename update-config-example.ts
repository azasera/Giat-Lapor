// Contoh update untuk googleConfig.ts
// Ganti nilai placeholder dengan yang asli

export const GOOGLE_CONFIG = {
  clientId: "190080872114-gb25knmf1gkrmn5nlsmikkmaifhjptdq.apps.googleusercontent.com",
  projectId: "laporan-kepsek",
  apiKey: "AIzaSy_YOUR_ACTUAL_API_KEY_HERE", // ← Ganti dengan API key asli
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
  ],
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
};

// Ganti dengan folder ID asli dari Google Drive
export const DRIVE_FOLDER_ID = "1YOUR_ACTUAL_FOLDER_ID_HERE";

// Ganti dengan template ID asli dari Google Sheets  
export const SHEETS_TEMPLATE_ID = "1YOUR_ACTUAL_TEMPLATE_ID_HERE";