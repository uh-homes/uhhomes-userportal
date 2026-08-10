import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineHome, HiOutlineDocumentDownload } from "react-icons/hi";
import floorPlanCatalog from "./floorPlanCatalogData";
import { generateFloorPlanCatalogPDF } from "./generateFloorPlanPDF";
import { toast } from "react-toastify";

export default function SalesAgentProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get("/sales/properties");
        setProperties(res.data.data);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filtered = properties.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  };

  const getFloorPlanData = (propertyName) => {
    if (!propertyName) return null;
    const key = propertyName.toLowerCase().trim();
    return floorPlanCatalog[key] || null;
  };

  const handleDownloadCatalog = async (e, property) => {
    e.stopPropagation();
    const planData = getFloorPlanData(property.name);
    if (!planData) {
      toast.error("Catalog data not available for this property.");
      return;
    }

    setGeneratingPDF(property.id);
    try {
      await generateFloorPlanCatalogPDF(planData);
      toast.success(`${planData.name} catalog downloaded!`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate catalog PDF.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Property Catalog</h1>
        <div className="relative w-full sm:w-72">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <HiOutlineHome className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No properties found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((property) => {
            const planData = getFloorPlanData(property.name);
            const isGenerating = generatingPDF === property.id;

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#C5A572]/40 transition-all cursor-pointer"
                onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)}
              >
                {property.thumbnail ? (
                  <img src={property.thumbnail} alt={property.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                    <HiOutlineHome className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-[#1A1A1A] font-semibold text-lg mb-1">{property.name}</h3>
                  {property.location && (
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                      <HiOutlineLocationMarker className="w-4 h-4" />
                      {property.location}
                    </p>
                  )}
                  <p className="text-xl font-bold text-[#C5A572] mb-2">{formatPrice(property.price)}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {property.bedrooms && <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded">{property.bedrooms} Beds</span>}
                    {property.bathrooms && <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded">{property.bathrooms} Baths</span>}
                    {property.squareFeet && <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded">{property.squareFeet.toLocaleString()} sqft</span>}
                    {property.garageSpaces && <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded">{property.garageSpaces} Garage</span>}
                  </div>

                  {/* Lead count from this agent */}
                  {property.leads?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-[#C5A572] font-medium">{property.leads.length} lead(s) assigned</span>
                    </div>
                  )}

                  {/* Download Catalog Button */}
                  {planData && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => handleDownloadCatalog(e, property)}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#333] disabled:opacity-60 transition-colors"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <HiOutlineDocumentDownload className="w-4 h-4" />
                            Download Catalog
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Expanded details */}
                  {selectedProperty?.id === property.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {property.description && <p className="text-sm text-gray-600">{property.description}</p>}
                      {property.storyCount && <p className="text-xs text-gray-500">Stories: {property.storyCount}</p>}
                      {property.elevation && <p className="text-xs text-gray-500">Elevation: {property.elevation}</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
