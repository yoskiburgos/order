"use strict";

const Hapi = require("hapi");
const configRegister = require("./configRegister");

const app = async (config) => {
  const { host, port } = config;
  const server = Hapi.server({ host, port });

  server.app.config = config;
  await configRegister.register(server);
  return server;
};

module.exports = app;
