/**
 * Middleware to check user permissions for a specific module and action.
 * Usage: checkPermission("gallery", "read") or checkPermission("documents", "upload")
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    // Admins always have full access
    if (req.user?.role === "admin") return next();

    const permissions = req.user?.permissions;

    // If no permissions are set, use defaults (allow read)
    if (!permissions) return next();

    const modulePerms = permissions[module];

    if (!modulePerms) {
      // Module not defined in permissions, allow by default
      return next();
    }

    if (modulePerms[action] === false) {
      return res.status(403).json({
        status: "error",
        message: `Access denied. You don't have "${action}" permission for "${module}".`,
        permissionRequired: { module, action },
      });
    }

    next();
  };
};

module.exports = checkPermission;
