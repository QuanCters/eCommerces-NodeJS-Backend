const app = require("./src/app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`WebService eCommerce start with port: ${PORT}`);
});

// exit server when use ctrl+c
process.on("SIGINT", () => {
  server.close(() => console.log(`EXIT SERVER EXPRESS`));
});
