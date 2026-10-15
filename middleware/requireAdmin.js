const requireAdmin = (req, res, next) => {
  if (!req.user || String(req.user.role || '').toLowerCase() !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

module.exports = requireAdmin;
