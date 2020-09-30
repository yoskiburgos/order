"use strict";
const plugins = require("./plugins/index");
const routes = require("./api/routes/routes");

module.exports.register = async (server) => {
  //Registrando plugins
  await plugins.register(server);
  // //Registrando rutas
  await routes.register(server);
};
