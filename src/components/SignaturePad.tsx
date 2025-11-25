import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

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

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden ${className}`}>
      <div className="relative" style={{ width: width, height: height }}>
        {readOnly && initialSignature ? (
          // Display saved signature as an image, centered
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <img src={initialSignature} alt="Tanda Tangan" className="max-w-full max-h-full object-contain" />
          </div>
        ) : readOnly && !initialSignature ? (
          // Display "Tidak ada tanda tangan" when readOnly and no signature
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 bg-opacity-70 text-gray-500 dark:text-gray-400 text-sm">
            Tidak ada tanda tangan
          </div>
        ) : (
          // Render interactive SignatureCanvas for drawing/editing
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              width: width,
              height: height,
              className: 'signature-canvas',
              style: { backgroundColor: backgroundColor, touchAction: 'none' }
            }}
            penColor={penColor}
            onEnd={handleEnd}
            minWidth={0.5} // Dikembalikan ke 0.5 untuk isolasi masalah
            maxWidth={2}
            dotSize={0.5} // Dikembalikan ke 0.5 untuk isolasi masalah
            velocityFilterWeight={0.9}
          />
        )}
      </div>
      {!readOnly && (
        <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-md">
          <button
            type="button"
            onClick={handleClear}
            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
            title="Hapus Tanda Tangan"
          >
            <Eraser className="w-4 h-4" />
          </button>
          {hasDrawn && (
            <button
              type="button"
              onClick={() => {
                onSave?.(sigCanvas.current?.toDataURL('image/png') || '');
              }}
              className="ml-2 p-1 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-colors"
              title="Konfirmasi Tanda Tangan"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default SignaturePad;