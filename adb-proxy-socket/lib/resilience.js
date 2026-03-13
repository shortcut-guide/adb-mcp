/**
 * adb-proxy-socket/lib/resilience.js
 * Logic for exponential backoff retries and standardized error reporting.
 */

/**
 * Executes a function with exponential backoff retries.
 * @param {Function} fn - The async function to execute.
 * @param {Object} options - Retry options.
 * @param {number} options.maxRetries - Maximum number of retries.
 * @param {number} options.initialDelay - Initial delay in milliseconds.
 * @param {number} options.factor - Exponential backoff factor.
 */
async function withRetry(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 1000, factor = 2 } = options;
    let delay = initialDelay;
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i === maxRetries) break;
            
            if (isRetryable(lastError)) {
                console.warn(`[Resilience] Attempt ${i + 1} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= factor;
            } else {
                break;
            }
        }
    }
    throw lastError;
}

/**
 * Determines if an error is transient and should be retried.
 */
function isRetryable(error) {
    const message = (error.message || String(error)).toUpperCase();
    return (
        message.includes('TIMEOUT') || 
        message.includes('ECONNREFUSED') || 
        message.includes('NETWORK_ERROR') ||
        message.includes('EPIPE')
    );
}

/**
 * Standardized Error Types
 */
const ErrorTypes = {
    LAYER_NOT_FOUND: 'LAYER_NOT_FOUND',
    TYPE_MISMATCH: 'TYPE_MISMATCH',
    APPLY_PARTIAL_FAILED: 'APPLY_PARTIAL_FAILED',
    MCP_TIMEOUT: 'MCP_TIMEOUT',
    INVALID_IMAGE_FORMAT: 'INVALID_IMAGE_FORMAT',
    INVALID_TEXT_LENGTH: 'INVALID_TEXT_LENGTH',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
    INVALID_DATA_TYPE: 'INVALID_DATA_TYPE'
};

module.exports = { 
    withRetry,
    ErrorTypes
};
