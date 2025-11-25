import { GOOGLE_CONFIG, DRIVE_FOLDER_ID, SHEETS_TEMPLATE_ID } from '../config/googleConfig';
import { ReportData, Activity, Achievement, DetailedEvaluationItem, allDetailedEvaluationItems, activityCategories, reportPeriodOptions, ReportPeriodKey } from '../types/report';

// Define a simple user profile interface
interface UserProfile {
  getName(): string;
  getEmail(): string;
  getImageUrl(): string;
}

export class GoogleService {
  private static instance: GoogleService;
  private gapi: any = null;
  private gsi: any = null; // Reference to google.accounts
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private currentUserProfile: UserProfile | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleService {
    if (!GoogleService.instance) {
      GoogleService.instance = new GoogleService();
    }
    return GoogleService.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      console.log('🔧 Initializing Google API (GIS migration)...');

      // Load both gapi.js and gsi/client.js
      await Promise.all([this.loadGapiScript(), this.loadGsiScript()]);
      console.log('✅ Google API and GSI scripts loaded');

      // Ensure gapi and google.accounts are available
      this.gapi = (window as any).gapi;
      this.gsi = (window as any).google.accounts;

      if (!this.gapi || !this.gsi) {
        throw new Error('gapi or google.accounts not loaded after scripts.');
      }

      // Initialize gapi.client for Drive, Sheets, and People
      await new Promise<void>((resolve, reject) => {
        this.gapi.load('client', {
          callback: async () => {
            console.log('✅ gapi client loaded');
            try {
              await this.gapi.client.init({
                apiKey: GOOGLE_CONFIG.apiKey,
                discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
              });
              console.log('✅ gapi.client initialized');
              resolve();
            } catch (initError) {
              console.error('❌ gapi.client.init failed:', initError);
              reject(initError);
            }
          },
          onerror: (error: any) => {
            console.error('❌ Failed to load gapi client:', error);
            reject(error);
          }
        });
      });

      // Initialize the Token Client for authentication
      this.tokenClient = this.gsi.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes.join(' '),
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Token client callback error:', tokenResponse.error);
            this.accessToken = null;
            this.currentUserProfile = null;
            this.gapi.client.setToken(null); // Clear token from gapi.client
          } else {
            this.accessToken = tokenResponse.access_token;
            this.gapi.client.setToken({ access_token: this.accessToken }); // Set token for gapi.client
            console.log('Access token obtained and set for gapi.client:', this.accessToken);
            // Fetch user info after getting the token
            this.fetchUserProfile();
          }
        },
      });
      console.log('✅ Google Identity Services Token Client initialized');

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google API (GIS):', error);
      return false;
    }
  }

  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-api-script')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(new Error('Failed to load Google API script.'));
      document.head.appendChild(script);
    });
  }

  private loadGsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-gsi-script') && (window as any).google?.accounts) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Poll until window.google.accounts is available
        const checkGsi = () => {
          if ((window as any).google?.accounts) {
            resolve();
          } else {
            setTimeout(checkGsi, 50); // Check again after a short delay
          }
        };
        checkGsi();
      };
      script.onerror = (error) => reject(new Error('Failed to load Google GSI script.'));
      document.head.appendChild(script);
    });
  }

  private async fetchUserProfile(): Promise<void> {
    if (!this.accessToken || !this.gapi) {
      this.currentUserProfile = null;
      return;
    }
    try {
      // Ensure the token is set before making the call
      if (!this.gapi.client.getToken() || this.gapi.client.getToken().access_token !== this.accessToken) {
          this.gapi.client.setToken({ access_token: this.accessToken });
      }

      // Use Google People API to fetch user profile
      const response = await this.gapi.client.people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,photos',
      });
      
      const profile = response.result;
      this.currentUserProfile = {
        getName: () => profile.names?.[0]?.displayName || profile.emailAddresses?.[0]?.value || 'User',
        getEmail: () => profile.emailAddresses?.[0]?.value || '',
        getImageUrl: () => profile.photos?.[0]?.url || '',
      };
      console.log('User profile fetched:', this.currentUserProfile.getEmail());
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      this.currentUserProfile = null;
    }
  }

  public async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      if (!this.tokenClient) {
        throw new Error('Google Token Client not initialized.');
      }

      return new Promise((resolve, reject) => {
        // Add timeout to prevent indefinite waiting
        const timeoutId = setTimeout(() => {
          console.log('Google sign-in timeout - user likely cancelled');
          resolve(false);
        }, 8000); // 8 second timeout

        // Prompt the user to select a Google account and authorize the app
        this.tokenClient.callback = async (tokenResponse: any) => {
          clearTimeout(timeoutId); // Clear timeout when callback is called

          if (tokenResponse.error) {
            console.error('Sign-in failed:', tokenResponse.error);
            this.accessToken = null;
            this.currentUserProfile = null;
            this.gapi.client.setToken(null); // Clear token from gapi.client
            resolve(false);
          } else {
            this.accessToken = tokenResponse.access_token;
            this.gapi.client.setToken({ access_token: this.accessToken }); // Set token for gapi.client
            console.log('Access token obtained and set for gapi.client:', this.accessToken);
            await this.fetchUserProfile(); // Fetch profile after successful token acquisition
            resolve(true);
          }
        };

        try {
          this.tokenClient.requestAccessToken();
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error requesting access token:', error);
          resolve(false);
        }
      });
    } catch (error) {
      console.error('Failed to sign in:', error);
      return false;
    }
  }

  public async signOut(): Promise<void> {
    try {
      if (!this.isInitialized || !this.accessToken) return;

      this.gsi.oauth2.revoke(this.accessToken, () => {
        console.log('Access token revoked.');
        this.accessToken = null;
        this.currentUserProfile = null;
        this.gapi.client.setToken(null); // Clear token from gapi.client
      });
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }

  public isSignedIn(): boolean {
    return !!this.accessToken;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUserProfile;
  }

  // Upload file to Google Drive
  public async uploadToDrive(file: File, fileName: string): Promise<string> {
    try {
      if (!this.isInitialized || !this.isSignedIn() || !this.accessToken) {
        throw new Error('Not authenticated with Google');
      }

      const metadata = {
        name: fileName,
        parents: [DRIVE_FOLDER_ID]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(`Drive upload failed: ${result.error.message}`);
      }
      return result.id;
    } catch (error) {
      console.error('Failed to upload to Drive:', error);
      throw error;
    }
  }

  // Create Google Sheets document
  public async createSheetsDocument(title: string, data: any[], parentFolderId?: string): Promise<string> {
    try {
      if (!this.isInitialized || !this.isSignedIn() || !this.accessToken) {
        throw new Error('Not authenticated with Google');
      }

      // Ensure sheets API is loaded
      await this.gapi.client.load('sheets', 'v4');

      // Create new spreadsheet
      const response = await this.gapi.client.sheets.spreadsheets.create({
        properties: {
          title: title
        },
        // Add to specific folder if parentFolderId is provided
        ...(parentFolderId && { parents: [parentFolderId] })
      });

      const spreadsheetId = response.result.spreadsheetId;

      // Add data to the spreadsheet
      if (data.length > 0) {
        await this.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: 'A1',
          valueInputOption: 'RAW',
          resource: {
            values: data
          }
        });
      }

      // Move the created sheet to the specified DRIVE_FOLDER_ID
      if (DRIVE_FOLDER_ID) {
        await this.gapi.client.drive.files.update({
          fileId: spreadsheetId,
          addParents: DRIVE_FOLDER_ID,
          removeParents: 'root' // Remove from root folder
        });
      }

      return spreadsheetId;
    } catch (error) {
      console.error('Failed to create Sheets document:', error);
      throw error;
    }
  }

  // Helper to calculate average score from detailed evaluation
  private getAverageScoreFromDetailedEvaluation(evaluation: { [itemId: string]: number }): number {
    const scores = Object.values(evaluation);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Export all report data to a new Google Sheets document
  public async exportReportToSheets(reports: ReportData[]): Promise<string> {
    try {
      const headers = [
        'ID', 'Tanggal', 'Kepala Sekolah', 'Sekolah', 'Periode',
        'Jumlah Kegiatan', 'Jumlah Prestasi', 'Rata-rata Kinerja KS', 'Rata-rata Kinerja (Penilaian Yayasan)', 'Status'
      ];

      const data = reports.map(report => [
        report.id,
        report.date,
        report.principalName,
        report.schoolName,
        reportPeriodOptions[report.period as ReportPeriodKey] || report.period, // Use Indonesian label
        report.activities.length,
        report.achievements.length,
        (this.getAverageScoreFromDetailedEvaluation(report.principalEvaluation) * 10).toFixed(0) + '%', // Convert to percentage
        report.foundationEvaluation ? (this.getAverageScoreFromDetailedEvaluation(report.foundationEvaluation) * 10).toFixed(0) + '%' : 'N/A', // Convert to percentage
        report.status
      ]);

      const allData = [headers, ...data];
      const title = `Laporan Kepala Sekolah - ${new Date().toLocaleDateString('id-ID')}`;

      return await this.createSheetsDocument(title, allData);
    } catch (error) {
      console.error('Failed to export all reports to Sheets:', error);
      throw error;
    }
  }

  // Submit a single report to a new Google Sheets document
  public async submitSingleReportToSheets(report: ReportData): Promise<string> {
    try {
      if (!this.isInitialized || !this.isSignedIn() || !this.accessToken) {
        throw new Error('Not authenticated with Google');
      }

      const title = `Laporan_${report.principalName.replace(/\s/g, '_')}_${report.date}_${report.id}`;

      // Flatten report data for a single sheet
      const reportDataArray: any[][] = [];

      // Basic Info
      reportDataArray.push(['Informasi Dasar']);
      reportDataArray.push(['ID Laporan', report.id]);
      reportDataArray.push(['Tanggal Laporan', report.date]);
      reportDataArray.push(['Nama Kepala Sekolah', report.principalName]);
      reportDataArray.push(['Nama Sekolah', report.schoolName]);
      reportDataArray.push(['Periode Laporan', reportPeriodOptions[report.period as ReportPeriodKey] || report.period]); // Use Indonesian label
      reportDataArray.push(['Status', report.status]);
      reportDataArray.push(['Dikirim Pada', report.submittedAt || '-']);
      reportDataArray.push([]); // Spacer

      // Activities
      reportDataArray.push(['Kegiatan yang Dilaksanakan']);
      if (report.activities.length > 0) {
        report.activities.forEach((activity, index) => {
          reportDataArray.push([`Kegiatan ${index + 1}`]);
          reportDataArray.push(['Kategori', activity.category]);
          reportDataArray.push(['Nama Kegiatan', activity.title]);
          reportDataArray.push(['Deskripsi', activity.description]);
          reportDataArray.push(['Tanggal Pelaksanaan', activity.date]); // Menggunakan activity.date yang sekarang merujuk ke Tanggal Pelaksanaan
          reportDataArray.push(['Waktu Pelaksanaan', activity.time]);
          reportDataArray.push(['Lokasi', activity.location]);
          reportDataArray.push(['Pihak Terlibat', activity.involvedParties]);
          reportDataArray.push(['Tujuan', activity.goals]);
          reportDataArray.push(['Hasil', activity.results]);
          reportDataArray.push(['Dampak', activity.impact]);
          reportDataArray.push(['Kendala', activity.challenges]);
          reportDataArray.push(['Solusi', activity.solutions]);
          reportDataArray.push(['Rencana Tindak Lanjut', activity.followUpPlan]);
          reportDataArray.push(['Link Dokumentasi', activity.documentationLink]);
          reportDataArray.push(['Link Lampiran', activity.attachmentLink]);
          reportDataArray.push(['Catatan Tambahan', activity.additionalNotes]);
          reportDataArray.push([]); // Spacer
        });
      } else {
        reportDataArray.push(['Tidak ada kegiatan yang dicatat.']);
        reportDataArray.push([]); // Spacer
      }

      // Principal's Evaluation
      reportDataArray.push(['Evaluasi Kinerja Kepala Sekolah (Penilaian Diri)']);
      allDetailedEvaluationItems.forEach(item => {
        const score = report.principalEvaluation[item.id];
        const description = item.bobotOptions.find(opt => opt.score === score)?.description || 'N/A';
        reportDataArray.push([`${item.bidang} - ${item.kategori} - ${item.item}`, `${(score ?? 0)}% - ${description}`]); // Display score directly as percentage
      });
      reportDataArray.push(['Rata-rata Kinerja Diri', (this.getAverageScoreFromDetailedEvaluation(report.principalEvaluation) * 10).toFixed(0) + '%']); // Convert to percentage
      reportDataArray.push([]); // Spacer

      // Foundation's Evaluation (if available)
      if (report.foundationEvaluation && Object.keys(report.foundationEvaluation).length > 0) {
        reportDataArray.push(['Evaluasi Kinerja Kepala Sekolah (Penilaian Yayasan)']);
        allDetailedEvaluationItems.forEach(item => {
          const score = report.foundationEvaluation?.[item.id];
          const description = item.bobotOptions.find(opt => opt.score === score)?.description || 'N/A';
          reportDataArray.push([`${item.bidang} - ${item.kategori} - ${item.item}`, `${(score ?? 0)}% - ${description}`]); // Display score directly as percentage
        });
        reportDataArray.push(['Rata-rata Kinerja (Penilaian Yayasan)', (this.getAverageScoreFromDetailedEvaluation(report.foundationEvaluation) * 10).toFixed(0) + '%']); // Convert to percentage
        reportDataArray.push([]); // Spacer
      }


      // Achievements
      reportDataArray.push(['Prestasi & Pencapaian']);
      if (report.achievements.length > 0) {
        report.achievements.forEach((achievement, index) => {
          reportDataArray.push([`Prestasi ${index + 1}`]);
          reportDataArray.push(['Judul', achievement.title]);
          reportDataArray.push(['Deskripsi', achievement.description]);
          reportDataArray.push(['Dampak', achievement.impact]);
          reportDataArray.push(['Bukti', achievement.evidence]);
          reportDataArray.push([]); // Spacer
        });
      } else {
        reportDataArray.push(['Tidak ada prestasi yang dicatat.']);
        reportDataArray.push([]); // Spacer
      }

      return await this.createSheetsDocument(title, reportDataArray);
    } catch (error) {
      console.error('Failed to submit single report to Sheets:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleService = GoogleService.getInstance();