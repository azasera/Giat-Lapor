import React, { useState, useEffect } from 'react';
import { googleService } from '../services/googleService';
import { LogOut, User, Upload, FileSpreadsheet } from 'lucide-react';

interface GoogleAuthProps {
  onAuthChange?: (isSignedIn: boolean, user: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthChange }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const initializeGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const initialized = await googleService.initialize();
      
      if (initialized) {
        const signedIn = googleService.isSignedIn();
        setIsSignedIn(signedIn);
        
        if (signedIn) {
          const currentUser = googleService.getCurrentUser();
          setUser(currentUser);
        }
        
        onAuthChange?.(signedIn, user);
      }
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const success = await googleService.signIn();

      if (success) {
        const currentUser = googleService.getCurrentUser();
        setIsSignedIn(true);
        setUser(currentUser);
        onAuthChange?.(true, currentUser);
      } else {
        // User cancelled the sign-in process or it failed
        console.log('Google sign-in was cancelled or failed');
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      // Only show alert for actual errors, not for user cancellation
      const errorMsg = error?.toString() || '';
      if (!errorMsg.includes('popup_closed_by_user') && !errorMsg.includes('timeout')) {
        alert('Gagal masuk ke Google. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await googleService.signOut();
      setIsSignedIn(false);
      setUser(null);
      onAuthChange?.(false, null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {isSignedIn ? (
        <>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <User className="w-4 h-4" />
            <span className="hidden sm:block">
              {user?.getName() || 'User'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Keluar</span>
          </button>
        </>
      ) : (
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center p-2 text-sm bg-white hover:bg-gray-50 dark:bg-gray-100 dark:hover:bg-gray-200 border border-gray-300 dark:border-gray-400 rounded-lg transition-colors shadow-sm"
          title="Masuk Google"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default GoogleAuth;
