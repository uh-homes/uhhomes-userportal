import React, { useState } from "react";
import { HiOutlinePhotograph } from "react-icons/hi";
import Lightbox from "../../Components/Lightbox";

export default function ConstructionGallery({ gallery = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Group images by phase/gallery item
  const phases = gallery
    .filter((g) => g.media && g.media.length > 0)
    .map((g) => ({
      id: g.id,
      phase: g.phase || g.caption || "Uncategorized",
      images: g.media.filter((m) => m.url).map((m) => ({ url: m.url, id: m.id })),
    }));

  const openLightbox = (phaseImages, clickedIndex) => {
    setLightboxImages(phaseImages);
    setLightboxIndex(clickedIndex);
    setLightboxOpen(true);
  };

  if (phases.length === 0) {
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-7xl mx-auto">
          <header className="mb-2 mt-6">
            <h1 className="text-2xl text-gray-800 mb-2">Gallery</h1>
          </header>
          <div className="text-center py-12">
            <HiOutlinePhotograph className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No images available in gallery</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 mt-6">
          <h1 className="text-2xl text-gray-800">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{phases.reduce((sum, p) => sum + p.images.length, 0)} photos across {phases.length} phases</p>
        </header>

        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{phase.images.length} photo{phase.images.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {phase.images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="relative group rounded-lg overflow-hidden aspect-square cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openLightbox(phase.images, idx)}
                  >
                    <img
                      src={img.url}
                      alt={`${phase.phase} - ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
