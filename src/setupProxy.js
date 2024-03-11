module.exports = function (app) {
  app.use(function (request, response, next) {
    response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    response.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    response.setHeader(
      "Access-Control-Allow-Origin",
      "https://lh3.googleusercontent.com"
    );
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  });
};
