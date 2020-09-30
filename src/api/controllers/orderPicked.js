"use strict";
const orderPicked = require("../../application/services/orderPicked");

module.exports.register = async (server) => {
  server.route({
    method: "POST",
    path: "/api/orderPicked",  
    config: {        
      handler:  orderPicked.orderPicked
    },
  });
  
};