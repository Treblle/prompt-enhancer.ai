const response = require('../utils/response');

/**
 * Validates a request body against a schema
 * @param {Object} schema - Validation schema
 */
function validateBody(schema) {
    return (req, res, next) => {
        const errors = [];

        // Check required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (req.body[field] === undefined) {
                    errors.push(`Field '${field}' is required`);
                }
            }
        }

        // Check field types and constraints
        if (schema.properties) {
            for (const [field, config] of Object.entries(schema.properties)) {
                if (req.body[field] !== undefined) {
                    // Type validation
                    if (config.type === 'string' && typeof req.body[field] !== 'string') {
                        errors.push(`Field '${field}' must be a string`);
                    }

                    // Enum validation
                    if (config.enum && !config.enum.includes(req.body[field])) {
                        errors.push(`Field '${field}' must be one of: ${config.enum.join(', ')}`);
                    }
                }
            }
        }

        // If validation fails, return error
        if (errors.length > 0) {
            return res.status(400).json(
                response.error('validation_error', 'Validation failed', errors)
            );
        }

        // If validation passes, continue
        next();
    };
}

module.exports = {
    validateBody
};