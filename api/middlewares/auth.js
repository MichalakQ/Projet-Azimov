import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) {
        return res.status(401).json({ success: false, error: 'Token manquant' });
    }
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Accès interdit',
                required: roles,
                current: req.user?.role
            });
        }
        next();
    };
};
