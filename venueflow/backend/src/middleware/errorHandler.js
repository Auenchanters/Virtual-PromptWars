/**
 * Global error handling middleware.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
};

module.exports = { errorHandler };
