"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#059669', // Emerald-600
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#dc2626', // Red-600
            color: '#fff',
          },
        },
        loading: {
          duration: Infinity, // Keep loading toast open until dismissed
          style: {
            background: '#fbbf24', // Amber-400
            color: '#000',
          },
        },
      }}
    />
  );
};

export default ToastProvider;