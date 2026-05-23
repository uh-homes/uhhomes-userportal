import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { SlLocationPin } from "react-icons/sl";
import { Slide, toast } from "react-toastify";

import { addWishlist, removeWishlist } from "../store/slice/wishlistSlice";
import api from "../Api/api";
import AuthenticationModal from "../Auth/AuthenticationModal";

const pluralize = (value, singular, plural = `${singular}`) => {
  if (value === undefined || value === null) {
    return `- ${plural}`;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return `- ${plural}`;
  }

  const suffix = amount === 1 ? singular : plural;
  return `${amount} ${suffix}`;
};

const PropertyCard = ({
  id,
  thumbnail,
  name,
  price,
  location,
  bedrooms,
  bathrooms,
  halfBathCount,
  squareFeet,
  garageSpaces,
  storyCount,
  slug,
}) => {
  const user = useSelector((s) => s.user);
  const wishlist = useSelector((s) => s.wishlist);
  const isFavorite = wishlist?.some((p) => p?.propertyId === id);

  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const showToast = (message, type = "error") =>
    toast[type](message, {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Slide,
    });

  const onToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (saving) return;

    try {
      setSaving(true);

      const res = await api.post(`/favorites/toggle`, { propertyId: id });
      const payload = res?.data?.data;

      if (payload) {
        dispatch(addWishlist(payload));
      } else {
        dispatch(removeWishlist(id));
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        console.error("Favorite toggle failed:", err);
        showToast("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const propertyHighlights = [
    { icon: "/Floorplans/beds.svg", label: pluralize(bedrooms, "Bed") },
    { icon: "/Floorplans/bath.svg", label: pluralize(bathrooms, "Bath") },
    { icon: "/Floorplans/sqft.svg", label: squareFeet + " SqFt" },
    {
      icon: "/Floorplans/stories.svg",
      label: pluralize(storyCount, "Stories"),
    },
    {
      icon: "/Floorplans/garage.svg",
      label: pluralize(garageSpaces, "Garage"),
    },
    {
      icon: "/Floorplans/halfbath.svg",
      label: pluralize(halfBathCount, "Half Bath", "Half Baths"),
    },
  ];

  const renderCardContent = () => {
    const detailContainerClass = `flex flex-1 flex-col p-4${
      slug ? " transition duration-200 hover:bg-gray-50" : ""
    }`;

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-md">
        <div className="relative flex-shrink-0">
          <img
            src={thumbnail}
            alt={name}
            className="h-56 w-full object-cover"
          />
          <button
            onClick={onToggleFavorite}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-1 text-white backdrop-blur"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={saving}
          >
            {isFavorite ? (
              <IoMdHeart
                size={22}
                className="text-red-500 transition duration-300 ease-in-out hover:scale-120"
              />
            ) : (
              <IoMdHeartEmpty
                size={22}
                className="text-white transition duration-300 ease-in-out hover:scale-120"
              />
            )}
          </button>
        </div>

        <div className={detailContainerClass}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-white">-----</span>
            {/* <span className="font-semibold text-md">${price}</span> */}
          </div>

          <p className="text-sm font-semibold">{name}</p>
          <p className="mt-1 flex items-center text-sm text-gray-800">
            <SlLocationPin size={15} className="text-gray-900" />
            <span className="ml-2">{location}</span>
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 border-y-2 border-gray-300 py-4 text-sm text-gray-800">
            {propertyHighlights.map(({ icon, label }) => (
              <div
                key={`${icon}-${label}`}
                className="flex items-center gap-2"
              >
                <img src={icon} alt={label} className="h-5 w-5" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {slug ? (
        <Link to={`/floorplan/${slug}`} className="block h-full">
          {renderCardContent()}
        </Link>
      ) : (
        renderCardContent()
      )}

      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default PropertyCard;
