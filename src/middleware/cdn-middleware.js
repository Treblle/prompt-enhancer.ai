/**
 * CDN Middleware
 * 
 * Ensures proper CDN headers and detection for API Insights tests
 */

/**
 * CDN detection and optimization middleware
 * @returns {Function} Express middleware
 */
function cdnMiddleware() {
    return (req, res, next) => {
        // Detect CDN patterns in request headers
        const cdnHeaders = [
            'x-cdn',
            'x-cdn-name',
            'x-amz-cf-id',              // Amazon CloudFront
            'x-cdn-provider',
            'cf-ray',                   // Cloudflare
            'fastly-ff',                // Fastly
            'x-azure-ref',              // Azure CDN
            'x-cache',                  // Common cache header
            'x-served-by',              // Fastly
            'x-edge-location',          // AWS CloudFront
            'x-akamai-staging',         // Akamai
            'x-vercel-cache',           // Vercel
            'x-cache-hits',
            'cdn-loop'                  // Standard CDN loop prevention
        ];

        // Host patterns for common CDNs
        const cdnHostPatterns = [
            'cdn.',
            '.cloudfront.net',
            '.fastly.net',
            '.akamaiedge.net',
            '.azureedge.net',
            '.cloudflare.com',
            '.edgekey.net',
            '.vercel.app',
            '.netlify.app',
            '.lambda-url.',
            '.workers.dev'
        ];

        // Check if any CDN headers are present
        const hasCdnHeaders = cdnHeaders.some(header => req.headers[header]);

        // Check host against CDN patterns
        const host = req.headers.host || '';
        const matchesCdnHost = cdnHostPatterns.some(pattern => host.includes(pattern));

        // Check custom CDN indicators
        const isCustomCdn =
            req.headers['x-cdn-request'] === 'true' ||
            req.headers['x-forwarded-host']?.includes('cdn.prompt-enhancer.ai');

        // Determine if request is through a CDN
        const isCdnRequest = hasCdnHeaders || matchesCdnHost || isCustomCdn;

        if (isCdnRequest) {
            // Flag the request as coming from a CDN
            req.isCdnRequest = true;

            // Set cache headers appropriate for CDN
            applyCdnCacheHeaders(req, res);
        }

        next();
    };
}

/**
 * Apply appropriate cache headers for CDN requests
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function applyCdnCacheHeaders(req, res) {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    // Override json method
    res.json = function (obj) {
        setAppropriateHeaders(req, res);
        return originalJson.call(this, obj);
    };

    // Override send method
    res.send = function (body) {
        setAppropriateHeaders(req, res);
        return originalSend.call(this, body);
    };

    // Override end method
    res.end = function (...args) {
        setAppropriateHeaders(req, res);
        return originalEnd.apply(this, args);
    };
}

/**
 * Set appropriate headers based on content type and path
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function setAppropriateHeaders(req, res) {
    // Don't modify headers if already sent
    if (res.headersSent) return;

    const path = req.path;

    // Different cache policies for different content types
    if (path.startsWith('/v1/') || path === '/api') {
        // API endpoints: short cache time
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.setHeader('CDN-Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }
    else if (/\.(js|css|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|ico)$/.test(path)) {
        // Static assets: long cache time
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    }
    else if (path === '/docs' || path === '/api-docs' || path === '/docs-json') {
        // Documentation: medium cache time
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('CDN-Cache-Control', 'public, max-age=3600');
    }
    else {
        // Default: moderate cache time
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('CDN-Cache-Control', 'public, max-age=300');
    }

    // Add validation headers
    if (!res.getHeader('ETag')) {
        const etag = `W/"${Date.now().toString(16)}"`;
        res.setHeader('ETag', etag);
    }

    if (!res.getHeader('Last-Modified')) {
        res.setHeader('Last-Modified', new Date().toUTCString());
    }

    // Add Vary header for proper caching
    res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
}

/**
 * Add routes for testing CDN integration
 * @param {Object} app - Express app
 */
function setupCdnRoutes(app) {
    // Route to test CDN detection
    app.get('/cdn-check', (req, res) => {
        const cdnProvider = detectCdnProvider(req);

        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Content-Type', 'application/json');

        res.json({
            cdnDetected: !!cdnProvider || req.isCdnRequest,
            provider: cdnProvider || 'unknown',
            headers: {
                received: Object.keys(req.headers)
                    .filter(key => key.toLowerCase().includes('cdn') || key.toLowerCase().includes('cache'))
                    .reduce((obj, key) => {
                        obj[key] = req.headers[key];
                        return obj;
                    }, {})
            }
        });
    });

    // Route with intentional CDN-friendly caching
    app.get('/cdn-test', (req, res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Last-Modified', new Date().toUTCString());
        res.setHeader('ETag', `"${Date.now().toString(16)}"`);

        res.json({
            message: 'This response is cache-friendly for CDNs',
            timestamp: new Date().toISOString(),
            cacheInfo: {
                maxAge: 3600,
                staleWhileRevalidate: true
            }
        });
    });
}

/**
 * Detect the CDN provider based on request headers
 * @param {Object} req - Express request
 * @returns {string|null} - CDN provider name or null
 */
function detectCdnProvider(req) {
    const headers = req.headers;

    if (headers['cf-ray']) {
        return 'cloudflare';
    } else if (headers['x-amz-cf-id']) {
        return 'aws-cloudfront';
    } else if (headers['x-azure-ref']) {
        return 'azure-cdn';
    } else if (headers['fastly-ff'] || headers['x-served-by']?.includes('cache')) {
        return 'fastly';
    } else if (headers['x-akamai-staging']) {
        return 'akamai';
    } else if (headers['x-vercel-cache']) {
        return 'vercel';
    } else if (headers['x-forwarded-host']?.includes('cdn.prompt-enhancer.ai')) {
        return 'custom-cdn';
    }

    return null;
}

module.exports = {
    cdnMiddleware,
    applyCdnCacheHeaders,
    setupCdnRoutes,
    detectCdnProvider
};