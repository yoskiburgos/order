"use strict";

//const existeEnPosVirtual = async ({numOrden}) => {  

module.exports.getParametro = async envio => {
    var xcod=0;
    try{
        const db = envio.request.server.plugins.sql.client;
        const codParametro = envio.codParametro;
        const res = await db.orderPicked.getParametro( {codParametro} );
        xcod = parseInt(res.recordset[0].XPARAM_VALOR);
    }catch(err){  
        console.log("Error getParametro="+err);
        return null;
    }
    return xcod;
};

module.exports.existeUbigeo = async request => {
    var existe=false;
    try{  
        const db = request.server.plugins.sql.client;
        const comunaId = request.payload.Body.Client.comunaId;
        const res = await db.orderPicked.getUbigeo({comunaId});

        const cod = res.recordset[0].CodDistrito;
       
        console.log("cod ubigeo="+cod);

        if(cod.length>0){
            existe = true;
        }
       
    }catch(err){
        console.log("Error existeUbigeo="+err);
        
    }
    return existe;
}

module.exports.validarSolicitudOC = async request => {
    var salida= {"codigo":"-1", "mensaje":"Error"};
    
    try{
        const db = request.server.plugins.sql.client;
        const numOrden = request.payload.Body.OrderNumber;
 
        //Obtiene la descripcion
        const res = await db.orderPicked.validarSolicitudOC( {numOrden, codigo, mensaje} );
        //console.log("RES="+JSON.stringify(res))

        const data = res.recordset;
        var codigo =  data[0].CODIGO;
        var mensaje = data[0].MENSAJE; 
        
        salida = {"codigo":codigo, "mensaje":mensaje};
    }catch(err){
        console.log("Error validarSolicitudOC="+err);
    }

    return salida;
};
 
module.exports.existeEnPosVirtual = async request  => {
    const flagPos = false;

    try{
        const db = request.server.plugins.sql.client;
        const numOrden = request.payload.Body.OrderNumber;
    
        const res = await db.orderPicked.existeEnPosVirtual( {numOrden} );
        const tot = res.recordset.length;
       
        if(tot>0){
            const numRec = parseInt(res.recordsets[0].FLAG_POSVIRTUAL+"",10);
            if(numRec==1){
                flagPos = true
            }
        }

        console.log("flagPos//="+flagPos);

    }catch(err){
        console.log("Error atgGetExisteOrden ="+err);
        flagPos = false;
    }

    return flagPos;
}

module.exports.atgGetExisteOrden = async request  => {
    try{
        const db = request.server.plugins.sql.client;
        const numOrden = request.payload.Body.OrderNumber;
    
        const res = await db.orderPicked.atgGetExisteOrden( {numOrden} );
        const tot = res.recordset.length;  //0 si no existe 1 si existe

        return tot;
    }catch(err){
        console.log("Error atgGetExisteOrden ="+err);
        return 0;
    } 
}


module.exports.listaTablaGeneral = async envio => {
    try{
        const db = envio.request.server.plugins.sql.client;
        const flag = envio.flag;
        const codTabla = envio.codTabla;
        const res = await db.orderPicked.listaTablaGeneral( {flag, codTabla} );
         return res;
    }catch(err){
        console.log("Error listaTablaGeneral="+err);
        return null;
    }
}; 

module.exports.insertOrderQueue = async envio => {
   const db = envio.request.server.plugins.sql.client;
    const message = envio.message;
    const messageType = envio.messageType;
    const numOrden = envio.numOrden;
    const signature = envio.signature;
    const resultado =  await db.orderPicked.insertOrderQueue({ message, messageType, numOrden, signature });
    return resultado;
}

