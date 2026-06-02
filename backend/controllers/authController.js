const { generateToken, setTokenCookie } = require("../utils/generateToken");

// GET /auth/google — handled by passport middleware

// GET /auth/google/callback
exports.googleCallback = (req, res) => {
  const token = generateToken(req.user.id);
  setTokenCookie(res, token);

  // Redirect to frontend after successful Google auth
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/userportal`);
};
