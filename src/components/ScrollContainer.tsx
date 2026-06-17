import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const container = containerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Berikan toleransi beberapa piksel (5px) untuk pembulatan subpiksel di browser
      setShowLeft(scrollLeft > 5);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      // Amati perubahan pada children (misalnya saat data tabel baru selesai dimuat)
      const observer = new MutationObserver(checkScroll);
      observer.observe(container, { childList: true, subtree: true });

      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        observer.disconnect();
      };
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (container) {
      const amount = container.clientWidth * 0.6; // Geser sejauh 60% dari lebar container
      container.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/scroll-container w-full">
      {/* Efek Bayangan Fade Kiri */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 dark:from-black/25 to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
          showLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Efek Bayangan Fade Kanan */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 dark:from-black/25 to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
          showRight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Tombol Geser Kiri Melayang */}
      <button
        onClick={() => scroll('left')}
        type="button"
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:scale-110 active:scale-95 transition-all duration-200 z-20 ${
          showLeft ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-75'
        }`}
        title="Geser Kiri"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Tombol Geser Kanan Melayang */}
      <button
        onClick={() => scroll('right')}
        type="button"
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:scale-110 active:scale-95 transition-all duration-200 z-20 ${
          showRight ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-75'
        }`}
        title="Geser Kanan"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Konten Scrollable */}
      <div
        ref={containerRef}
        className={`overflow-x-auto scroll-smooth custom-scrollbar w-full ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
