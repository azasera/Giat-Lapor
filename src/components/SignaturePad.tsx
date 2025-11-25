import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check, Upload, Pencil } from 'lucide-react';

interface SignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  onSave?: (dataUrl: string) => void;
  initialSignature?: string; // Base64 string for initial signature
  readOnly?: boolean;
  className?: string;
}

export interface SignaturePadRef {
  clear: () => void;
  save: () => string | null;
  isEmpty: () => boolean;
}

// Mengubah deklarasi forwardRef untuk secara eksplisit mengetik parameter props dan ref
const SignaturePad = forwardRef((props: SignaturePadProps, ref: React.Ref<SignaturePadRef>) => {
  const {
    width = 250,
    height = 100,
    penColor = '#000000',
    backgroundColor = '#f0f0f0',
    onSave,
    initialSignature,
    readOnly = false,
    className,
  } = props;

  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose internal functions via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvas.current?.clear();
      setHasDrawn(false);
    },
    save: () => {
      if (sigCanvas.current?.isEmpty()) {
        return null;
      }
      return sigCanvas.current?.toDataURL('image/png') || null;
    },
    isEmpty: () => sigCanvas.current?.isEmpty() || true,
  }));

  React.useEffect(() => {
    // Only load initial signature onto the canvas if not in readOnly display mode
    // and the canvas ref is available.
    if (sigCanvas.current && !readOnly) {
      sigCanvas.current.clear(); // Explicitly clear the canvas
      if (initialSignature) {
        sigCanvas.current.fromDataURL(initialSignature);
        setHasDrawn(true);
      } else {
        setHasDrawn(false);
      }
    }
  }, [initialSignature, readOnly]); // Add readOnly to dependencies

  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setHasDrawn(false);
    onSave?.(''); // Clear saved signature data
  }, [onSave]);

  const handleEnd = useCallback(() => {
    if (!sigCanvas.current?.isEmpty()) {
      setHasDrawn(true);
      onSave?.(sigCanvas.current?.toDataURL('image/png') || '');
    }
  }, [onSave]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Mohon upload file gambar (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      setHasDrawn(true);
      onSave?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onSave]);

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-md ${className}`} style={{ width: width, height: height + 40 }}>
      <div style={{ width: width, height: height, position: 'relative' }}>
        {readOnly && initialSignature ? (
          // Display saved signature as an image - exact canvas size
          <img
            src={initialSignature}
            alt="Tanda Tangan"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              display: 'block'
            }}
          />
        ) : readOnly && !initialSignature ? (
          // Display "Tidak ada tanda tangan" when readOnly and no signature
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
            Tidak ada tanda tangan
          </div>
        ) : uploadedImage ? (
          // Display uploaded image
          <img
            src={uploadedImage}
            alt="Tanda Tangan"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              display: 'block',
              objectFit: 'contain'
            }}
          />
        ) : (
          // Render interactive SignatureCanvas for drawing/editing
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              width: width,
              height: height,
              className: 'signature-canvas',
              style: {
                backgroundColor: backgroundColor,
                touchAction: 'none',
                display: 'block'
              }
            }}
            penColor={penColor}
            onEnd={handleEnd}
            minWidth={1}
            maxWidth={3.5}
            dotSize={1.5}
            velocityFilterWeight={0.7}
          />
        )}
      </div>
      {!readOnly && (
        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded shadow-md transition-colors flex items-center gap-1"
              title="Upload Gambar Tanda Tangan"
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                handleClear();
                setUploadedImage(null);
              }}
              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
              title="Hapus Tanda Tangan"
            >
              <Eraser className="w-4 h-4" />
            </button>
            {hasDrawn && (
              <button
                type="button"
                onClick={() => {
                  if (uploadedImage) {
                    onSave?.(uploadedImage);
                  } else {
                    onSave?.(sigCanvas.current?.toDataURL('image/png') || '');
                  }
                }}
                className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-colors"
                title="Konfirmasi Tanda Tangan"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default SignaturePad;