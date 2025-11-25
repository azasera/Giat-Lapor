// Google API Configuration
export const GOOGLE_CONFIG = {
  clientId: "190080872114-3bnbcuv5iotr8776q63bk487mf9ei8uv.apps.googleusercontent.com", // <-- Client ID yang sudah diperbarui
  projectId: "laporan-kepsek",
  apiKey: "AIzaSyBgJfQcPy2H6WhbBU6YnCtjFqXWE7UGzNQ",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://sheets.googleapis.com/$discovery/rest?version=v4",
    "https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest", // Menambahkan discovery document untuk OAuth2
    "https://www.googleapis.com/discovery/v1/apis/people/v1/rest" // Menambahkan discovery document untuk Google People API
  ],
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "profile", // Menambahkan scope untuk informasi profil dasar
    "email"    // Menambahkan scope untuk alamat email
  ]
};

// Google Drive folder ID for storing reports
export const DRIVE_FOLDER_ID = "1Rq3Fk4YC2CJEQXAK-H0jJf23fIFdLyvf";

// Google Sheets template ID
export const SHEETS_TEMPLATE_ID = "1975-wwpIhjJGvPDpmnDCCZDiwQ2XA_c2zW7qxOC-kDA";