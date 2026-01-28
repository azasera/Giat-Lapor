import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Trash2, ZoomIn } from 'lucide-react';

interface SupervisionGalleryProps {
    photos: string[];
    onDelete?: (photoUrl: string) => Promise<void>;
    readOnly?: boolean;
}

const SupervisionGallery: React.FC<SupervisionGalleryProps> = ({
    photos,
    onDelete,
    readOnly = false
}) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [deleting, setDeleting] = useState<string | null>(null);

    if (!photos || photos.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <ImageIcon className="mx-auto mb-2" size={48} />
                <p>Belum ada dokumentasi foto/video</p>
            </div>
        );
    }

    const isVideo = (url: string) => {
        return url.match(/\.(mp4|webm|mov)$/i) !== null;
    };

    const handleDelete = async (photoUrl: string) => {
        if (!onDelete) return;

        if (!confirm('Yakin ingin menghapus foto/video ini?')) return;

        setDeleting(photoUrl);
        try {
            await onDelete(photoUrl);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Gagal menghapus file');
        } finally {
            setDeleting(null);
        }
    };

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextPhoto = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            {isVideo(photo) ? (
                                <video
                                    src={photo}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => openLightbox(index)}
                                />
                            ) : (
                                <img
                                    src={photo}
                                    alt={`Dokumentasi ${index + 1}`}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => openLightbox(index)}
                                />
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                                <button
                                    onClick={() => openLightbox(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-full"
                                >
                                    <ZoomIn size={20} className="text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Delete button */}
                        {!readOnly && onDelete && (
                            <button
                                onClick={() => handleDelete(photo)}
                                disabled={deleting === photo}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            >
                                {deleting === photo ? (
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        )}

                        {/* Media type indicator */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                            {isVideo(photo) ? (
                                <Video size={12} className="inline mr-1" />
                            ) : (
                                <ImageIcon size={12} className="inline mr-1" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevPhoto();
                                }}
                                className="absolute left-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
                            >
                                ‹
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextPhoto();
                                }}
                                className="absolute right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
                            >
                                ›
                            </button>
                        </>
                    )}

                    {/* Media content */}
                    <div
                        className="max-w-5xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isVideo(photos[currentIndex]) ? (
                            <video
                                src={photos[currentIndex]}
                                controls
                                autoPlay
                                className="w-full h-full max-h-[90vh] object-contain"
                            />
                        ) : (
                            <img
                                src={photos[currentIndex]}
                                alt={`Dokumentasi ${currentIndex + 1}`}
                                className="w-full h-full max-h-[90vh] object-contain"
                            />
                        )}
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-60 text-white text-sm rounded">
                        {currentIndex + 1} / {photos.length}
                    </div>
                </div>
            )}
        </>
    );
};

export default SupervisionGallery;
