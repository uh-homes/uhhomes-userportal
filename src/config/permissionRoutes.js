/**
 * Maps permission module keys to portal sidebar items.
 * Each portal uses this to dynamically show/hide menu items
 * based on the user's granted permissions from admin panel.
 * 
 * A menu item is visible if the user has read:true for that module.
 */

export const SUPERVISOR_MENU_CONFIG = [
  { permissionKey: "dashboard", title: "Dashboard", path: "/supervisor/dashboard" },
  { permissionKey: "constructionTracker", title: "Projects", path: "/supervisor/projects" },
  { permissionKey: "timeline", title: "Timeline", path: "/supervisor/timeline" },
  { permissionKey: "gallery", title: "Photo Gallery", path: "/supervisor/gallery" },
  { permissionKey: "documents", title: "Documents", path: "/supervisor/documents" },
  { permissionKey: "inquiries", title: "Inquiries", path: "/supervisor/inquiries" },
  { permissionKey: "alerts", title: "Alerts", path: "/supervisor/alerts" },

  { permissionKey: "reports", title: "Reports", path: "/supervisor/reports" },
  { permissionKey: null, title: "Site Updates", path: "/supervisor/updates" },
  { permissionKey: null, title: "Issues & Delays", path: "/supervisor/issues" },
  { permissionKey: "profile", title: "Profile", path: "/supervisor/profile" },
];

export const SALES_MENU_CONFIG = [
  { permissionKey: "dashboard", title: "Dashboard", path: "/sales/dashboard" },
  { permissionKey: "constructionTracker", title: "Property Catalog", path: "/sales/properties" },
  { permissionKey: "inquiries", title: "Prospect Leads", path: "/sales/leads" },
  { permissionKey: "timeline", title: "Property Tours", path: "/sales/tours" },
  { permissionKey: "favorites", title: "Buyer Accounts", path: "/sales/buyers" },
  { permissionKey: "reports", title: "Sales Pipeline", path: "/sales/pipeline" },
  { permissionKey: "profile", title: "Profile", path: "/sales/profile" },
];

/**
 * Filters menu items based on user permissions.
 * Items with no permissionKey (null) are always shown.
 * Items with a permissionKey are shown only if user has read access.
 */
export function filterMenuByPermissions(menuConfig, permissions) {
  if (!permissions) return menuConfig; // show all if permissions not loaded yet
  return menuConfig.filter((item) => {
    if (!item.permissionKey) return true; // always show items without a permission check
    return permissions[item.permissionKey]?.read === true;
  });
}
