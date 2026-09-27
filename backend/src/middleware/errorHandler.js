const isProduction = () => process.env.NODE_ENV === 'production';

export const errorHandler = (err, req, res, _next) => {
  // Malformed JSON bodies surface as a SyntaxError from express.json().
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Uploaded file is too large' });
  }

  const status = err.statusCode || err.status || 500;

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 && isProduction() ? 'Internal server error' : err.message || 'Internal server error',
    ...(!isProduction() && status >= 500 ? { stack: err.stack } : {}),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

export default { errorHandler, notFound };
