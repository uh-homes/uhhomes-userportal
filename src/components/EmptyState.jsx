import { HiOutlineDocumentText, HiOutlineClock, HiOutlinePhotograph, HiOutlineHeart, HiOutlineBell, HiOutlineHome, HiOutlineClipboardList } from "react-icons/hi";

const ICONS = {
  timeline: HiOutlineClock,
  gallery: HiOutlinePhotograph,
  documents: HiOutlineDocumentText,
  favorites: HiOutlineHeart,
  alerts: HiOutlineBell,
  project: HiOutlineHome,
  updates: HiOutlineClipboardList,
  default: HiOutlineDocumentText,
};

export default function EmptyState({ icon = "default", title, message, action, onAction }) {
  const Icon = ICONS[icon] || ICONS.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5EFE3] to-[#EDE6D8] flex items-center justify-center mb-6">
        <Icon className="w-9 h-9 text-[#C5A572]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed">{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {action}
        </button>
      )}
    </div>
  );
}
