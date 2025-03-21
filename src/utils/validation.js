/**
 * Utility functions for input validation
 */

/**
 * Validate that a value is included in a list of allowed values
 * @param {any} value - The value to check
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Object|null} Error object or null if validation passes
 */
exports.validateEnum = (value, allowedValues, fieldName) => {
    if (value && !allowedValues.includes(value)) {
        return {
            code: 'invalid_parameter',
            message: `The '${fieldName}' parameter must be one of: ${allowedValues.join(', ')}`,
            param: fieldName
        };
    }
    return null;
};

/**
 * Validate that a required field exists and is not empty
 * @param {any} value - The value to check
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Object|null} Error object or null if validation passes
 */
exports.validateRequired = (value, fieldName) => {
    if (!value) {
        return {
            code: 'missing_required_field',
            message: `The "${fieldName}" field is required`,
            param: fieldName
        };
    }
    return null;
};

/**
 * Validate that a string field has a minimum length
 * @param {string} value - The string to check
 * @param {number} minLength - Minimum allowed length
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Object|null} Error object or null if validation passes
 */
exports.validateMinLength = (value, minLength, fieldName) => {
    if (value && value.length < minLength) {
        return {
            code: 'invalid_parameter_length',
            message: `The '${fieldName}' must be at least ${minLength} characters long`,
            param: fieldName
        };
    }
    return null;
};

/**
 * Validate that a string field doesn't exceed a maximum length
 * @param {string} value - The string to check
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of the field for error messages
 * @returns {Object|null} Error object or null if validation passes
 */
exports.validateMaxLength = (value, maxLength, fieldName) => {
    if (value && value.length > maxLength) {
        return {
            code: 'invalid_parameter_length',
            message: `The '${fieldName}' must not exceed ${maxLength} characters`,
            param: fieldName
        };
    }
    return null;
};