"use strict";

const config = require("./config");
const server = require("./server");

const startServer = async () => {
  try {
    const app = await server(config);
    await app.start();

    console.log(`Servidor en: http://${config.host}:${config.port}...`);
  } catch (err) {
    console.log("Error en la carga:", err);
  }
};

startServer();
