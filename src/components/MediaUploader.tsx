import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader } from 'lucide-react';

interface MediaUploaderProps {
    onUpload: (files: File[]) => Promise<void>;
    maxFiles?: number;
    accept?: string;
    disabled?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
    onUpload,
    maxFiles = 10,
    accept = 'image/*,video/*',
    disabled = false
}) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ file: File; url: string; type: 'image' | 'video' }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const totalFiles = selectedFiles.length + fileArray.length;

        if (totalFiles > maxFiles) {
            alert(`Maksimal ${maxFiles} file`);
            return;
        }

        // Create previews
        const newPreviews = fileArray.map(file => {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'video';
            return { file, url, type: type as 'image' | 'video' };
        });

        setSelectedFiles([...selectedFiles, ...fileArray]);
        setPreviews([...previews, ...newPreviews]);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        // Revoke URL to free memory
        URL.revokeObjectURL(previews[index].url);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            await onUpload(selectedFiles);

            // Clear after successful upload
            previews.forEach(p => URL.revokeObjectURL(p.url));
            setSelectedFiles([]);
            setPreviews([]);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal upload file. Silakan coba lagi.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept={accept}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={disabled}
                />

                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                    Klik atau drag & drop file di sini
                </p>
                <p className="text-sm text-gray-500">
                    Foto (JPG, PNG, WebP) atau Video (MP4, WebM, MOV)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Maksimal {maxFiles} file • Foto: 10MB • Video: 50MB
                </p>
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">
                            {previews.length} file dipilih
                        </p>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || disabled}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader className="animate-spin" size={16} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Upload Semua
                                </>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    {preview.type === 'image' ? (
                                        <img
                                            src={preview.url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video size={48} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={uploading}
                                >
                                    <X size={16} />
                                </button>

                                {/* File type indicator */}
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                                    {preview.type === 'image' ? (
                                        <ImageIcon size={12} className="inline mr-1" />
                                    ) : (
                                        <Video size={12} className="inline mr-1" />
                                    )}
                                    {preview.file.size > 1024 * 1024
                                        ? `${(preview.file.size / (1024 * 1024)).toFixed(1)}MB`
                                        : `${(preview.file.size / 1024).toFixed(0)}KB`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaUploader;
