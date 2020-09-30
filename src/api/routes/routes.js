"use strict";
//Clase centralizadora de ruteo
const order = require("../controllers/orderPicked");

module.exports.register = async (server) => {
  
  await order.register(server);
};
