const Visit = require('../models/visit.model');

const trackTraffic = async (req, res, next) => {
    // Only track GET requests for API endpoints or page-like paths
    // Avoid tracking static files, administrative internal calls, or health checks
    if (req.method !== 'GET' ||
        req.path.startsWith('/api/admin') ||
        req.path.includes('.') ||
        req.path === '/api/health' ||
        req.path === '/') {
        return next();
    }

    try {
        const userAgent = req.headers['user-agent'] || '';
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

        // Simple device detection
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
        else if (/iPad|Android|Touch/i.test(userAgent)) deviceType = 'tablet';

        // Simple browser detection
        let browser = 'Other';
        if (/Chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/Safari/i.test(userAgent)) browser = 'Safari';
        else if (/Edge/i.test(userAgent)) browser = 'Edge';

        // Log the visit asynchronously (don't block the request)
        Visit.create({
            path: req.path,
            ip,
            userAgent,
            referrer,
            deviceType,
            browser,
            sessionID: req.headers['x-session-id'] // Optional: pass from frontend if needed
        }).catch(err => console.error('Error logging visit:', err.message));

    } catch (err) {
        // Fail silently to not disrupt the user experience
        console.error('Traffic tracking error:', err.message);
    }

    next();
};

module.exports = { trackTraffic };
