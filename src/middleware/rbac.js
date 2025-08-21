export function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role_name)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

export function scopeToBase(req, res, next) {
  req.scopedBaseId = (req.user.role_name === 'Admin') ? (req.query.base_id || null) : req.user.base_id;
  next();
}
