import React, { useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

export default function Lightbox({ images = [], currentIndex = 0, onClose, onIndexChange }) {
  const handlePrev = useCallback(() => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, handlePrev, handleNext]);

  if (!images.length) return null;

  const currentImage = images[currentIndex];
  const imageUrl = typeof currentImage === "string" ? currentImage : currentImage?.url;
  const caption = typeof currentImage === "object" ? currentImage?.caption : null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={onClose}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
      >
        <FaTimes className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm font-medium z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt={caption || `Photo ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";
          }}
        />
        {caption && (
          <p className="text-white/80 text-sm mt-3 text-center">{caption}</p>
        )}
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && images.length <= 20 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); onIndexChange(idx); }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
