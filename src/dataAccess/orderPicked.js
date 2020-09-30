"use strict";

const { MAX } = require("mssql");
const utils = require("./utils"); 

const register = async ({ sql, getConnection }) => { 
  //carpeta evento
  const querySQL = await utils.loadSqlQueries("../dataAccessContracts/orderPicked");

  
  const getParametro = async ({codParametro}) => {  
    const cnx = await getConnection();
        const request = await cnx.request();
  
        request.input("codParametro", sql.VarChar(20), codParametro);
    
        return request.query(querySQL.getParametro); 
  }
  
  
  const getUbigeo = async ({comunaId})  => {  
    const cnx = await getConnection();
    const request = await cnx.request();

    request.input("comunaId", sql.VarChar(10), comunaId);
   
    return request.query(querySQL.getUbigeo); 
  }

  const validarSolicitudOC = async ({numOrden}) => {  
    const cnx = await getConnection();
        const request = await cnx.request();
  
        const codigo = -1;
        const mensaje = "";
        request.input("numOrden", sql.VarChar(25), numOrden);
        request.input("codigo", sql.Int, codigo);
        request.input("mensaje", sql.VarChar(250), mensaje);
    
        return request.query(querySQL.validarSolicitudOC); 
  }
  
  const existeEnPosVirtual = async ({numOrden}) => {  
    const cnx = await getConnection();
        const request = await cnx.request();
  
        request.input("numOrden", sql.VarChar(50), numOrden);
    
        return request.query(querySQL.existeEnPosVirtual); 
  }

  const atgGetExisteOrden = async ({numOrden}) => {  
        const cnx = await getConnection();
        const request = await cnx.request();
  
        request.input("numOrden", sql.VarChar(50), numOrden);
    
        return request.query(querySQL.atgGetExisteOrden); 
    };

  const listaTablaGeneral = async ({flag, codTabla}) => {  
  //const orderPicked = async function() { 
      const cnx = await getConnection();
      const request = await cnx.request();

      request.input("flag", sql.Int, flag);
      request.input("codTabla", sql.VarChar(50), codTabla);
  
      //return request.query(querySQL.lista);
      return request.query(querySQL.listaTablaGeneral); 
  };

  const insertOrderQueue = async ({message, messageType, numOrden, signature}) => {  
    //const orderPicked = async function() { 
        const cnx = await getConnection();
        const request = await cnx.request();
  
        request.input("message", sql.VarChar(4000), message);
        request.input("messageType", sql.VarChar(50), messageType);
        request.input("numOrden", sql.VarChar(50), numOrden);
        request.input("signature", sql.VarChar(30), signature);
    
        //return request.query(querySQL.lista);
        return request.query(querySQL.insertOrderQueue);
    };

  //insertOrderQueue

  return {
    listaTablaGeneral, insertOrderQueue, atgGetExisteOrden,
    existeEnPosVirtual, validarSolicitudOC, getUbigeo, getParametro
  };
};

module.exports = { register };
