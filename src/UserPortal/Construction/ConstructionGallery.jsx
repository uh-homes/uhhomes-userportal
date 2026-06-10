import React, { useEffect, useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import Lightbox from "../../Components/Lightbox";

function useResponsivePerPage() {
  const getPerPage = () => {
    if (typeof window === "undefined") return 6;
    const w = window.innerWidth;
    if (w >= 1024) return 6;
    if (w >= 640) return 4;
    return 2;
  };

  const [perPage, setPerPage] = useState(getPerPage());

  useEffect(() => {
    const onResize = () => setPerPage(getPerPage());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return perPage;
}

export default function ConstructionGallery({ gallery = [] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const perPage = useResponsivePerPage();

  // Extract images from the gallery data structure
  const images = gallery.reduce((acc, galleryItem) => {
    if (galleryItem.media && galleryItem.media.length > 0) {
      // Add all media URLs from this gallery item
      galleryItem.media.forEach((media) => {
        if (media.url) {
          acc.push({
            url: media.url,
            caption: galleryItem.caption || `Gallery Image`,
            id: media.id,
          });
        }
      });
    }
    return acc;
  }, []);

  const totalPages = Math.max(1, Math.ceil(images.length / perPage));
  const startIndex = currentPage * perPage;
  const pageItems = images.slice(startIndex, startIndex + perPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "ArrowRight") nextPage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages]);

  if (images.length === 0) {
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-7xl mx-auto">
          <header className="mb-2 mt-6">
            <h1 className="text-2xl  text-gray-800 mb-2">Gallery</h1>
          </header>
          <p className="text-gray-500 text-center py-4">
            No images available in gallery
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        <header className="mb-2 mt-6">
          <h1 className="text-2xl  text-gray-800 mb-2">Gallery</h1>
        </header>

        <section className="rounded-xl p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((image, i) => (
              <div
                key={image.id || i}
                className="rounded-lg overflow-hidden border border-gray-200 transition-transform hover:shadow-md hover:-translate-y-1 group cursor-pointer"
                onClick={() => { setLightboxIndex(startIndex + i); setLightboxOpen(true); }}
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-56 object-cover"
                />
                {image.caption && (
                  <div className="p-2 bg-white">
                    <p className="text-sm text-gray-800 truncate">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-full bg-gradient text-white disabled:opacity-40 cursor-pointer transition-all"
                aria-label="Previous page"
              >
                <FiChevronLeft />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                      currentPage === i ? "bg-gradient w-4" : "bg-gray-300"
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-full bg-gradient text-white disabled:opacity-40 cursor-pointer transition-all"
                aria-label="Next page"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
