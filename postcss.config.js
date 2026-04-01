export default {
  plugins: {
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {})
  }
};
