const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); // Forbidden
        // Normalize property names to camelCase for consistency
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            companyId: decoded.company_id // Map snake_case to camelCase
        };
        next();
    });
}

module.exports = authenticateToken;
