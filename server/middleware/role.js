const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const userRole = req.user.role?.toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = role;
