function errorHandler(error, _req, res, _next) {
  const status = error.status ?? (error.name === "ValidationError" ? 400 : 500);
  const message = status < 500
    ? error.message
    : "The server could not complete the request. Please try again.";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
}

export default errorHandler;