"use strict";  
const uuid = require('uuid');
const modelo = require('../models/orderModel');

const configuracion = require('../config');


const orderPicked = async request => {
  var mensaje = {};
  try{
    request.payload.Body["UserID"] = configuracion.IdUsuario;
    request.payload.Body["OrderTypeID"] = configuracion.IdTipoOC;

    
    
    mensaje = await crearOrden(request);
  }catch(err){
    mensaje ={"codigo":-1,"mensaje":err};
    //Envio de la notificacion

 }
  

  return mensaje; 
}


const crearOrden = async request => {
  try {    
    const db = request.server.plugins.sql.client;
    var mensaje ={"codigo":-1,"mensaje":"Sin Respuesta"};

    
    //1. validacion 
    const valido = await  validacionInicialOrden(request);
    console.log("((((validaOrden))))----->"+valido); //0

    if(valido.trim.length==0){ 
      const rpta = await validaInput(request); //true: pasa las validaciones,  false: hay error
      if( rpta.valido){
        //Aca
        const idParam = await getIdParametro(request);
        request.payload.Body.Client["CountryID"] = idParam;
        //console.log("request.payload.Body.Client.CountryID="+request.payload.Body.Client.CountryID);

        //Guarda
        const rpta = await guardaOrderQueue(request);
        // rpta = {"Code":0,"Message":"Exito"}
        mensaje ={"codigo":rpta.Code,"mensaje":rpta.Message};

      }

    }else{
      mensaje ={"codigo":1,"mensaje":valido};
    }


    console.log("Mensaje Final ="+JSON.stringify(mensaje));


      return mensaje;
  } catch (err) { 
      console.log("Error Service:"+err);
    return  mensaje ={"codigo":-1,"mensaje":err};;
  }
};

//Sub Funciones---------------------------------------

const validaInput = async request => {
  
  var rpta = await validaRequest(request);
  //console.log("Rpta=="+JSON.stringify(rpta));

  const diferenteProd = await listaProductos(request);
  const numProd = await request.payload.Body.Products.length
  //console.log("num=="+numProd);

  const preNegativos =  await precioNegativo(request);
  const descNegativo =  await descuentoNegativo(request);
  
  const eUbigeo = await  modelo.existeUbigeo(request);
  if(!eUbigeo){
    rpta.valido=false;
    rpta.mensaje="El código de comunaId no está registrado.";
  }else{
    const tipoDoc = await validaTipoDocumento(request);
    if(!tipoDoc){
      rpta.valido=false;
      rpta.mensaje="Cliente con tipo de documento no registrado.";
    }else{
      //El resto de logica aca...
      
      if(numProd==0){
        rpta.valido=false;
        rpta.mensaje="La orden no con cuenta con productos.";
      }else{
        //Aca
        if(diferenteProd!=numProd){
          rpta.valido=false;
          rpta.mensaje="La orden tiene productos duplicados";
        }else{
          //Aca
          if(preNegativos>0){
            rpta.valido=false;
            rpta.mensaje="La orden tiene productos con precio de lista con valor cero";
          }else{
            //Aca
            if(descNegativo>0){
              rpta.valido=false;
              rpta.mensaje="La orden tiene productos con descuentos negativos";
            }
          }

        }
      }
    }
  }

  return rpta;
}

const validacionInicialOrden = async request => {
    var mensajeSalida = "";

    const numOrden = request.payload.Body.OrderNumber;
    const numO = parseInt(numOrden, 10);
    console.log("numO----->"+numO); //990003823

    if(numO>0){
      const num = await modelo.atgGetExisteOrden(request);
      console.log("num----->"+num);  //0 sino existe    1  si existe.

      const auditFlag = request.payload.Body.Client.Reset_flag;
      console.log("auditFlag----->"+auditFlag);  //false
      const pais = request.payload.Body.Pais.toLowerCase() ;
      console.log("pais----->"+pais);  //pe

      if(num>0){
          var flagPos = false;

          if(auditFlag){ //es true

            switch (pais) {
              case 'pe':
                  flagPos = await modelo.existeEnPosVirtual(request);  // true existe  - false no existe
                  console.log("flagPos----->"+flagPos);
                  if(flagPos){
                    mensajeSalida = "La orden de compra está en el PosVirtual";
                  }
                  break;
              default:
                  break;
            }

            if(!flagPos){
              //WS_SOL_ValidarSolicitudOC_PICKING     0 ok      1  Error nro pedido no existe
            
              const resp = await modelo.validarSolicitudOC(request); 
              console.log("ValidarSolicitudOC----->"+JSON.stringify(resp));

              if (resp != null && resp.codigo == 3){
                flagPos = true;
              }

              console.log("---->flagPos="+flagPos);


            }


          }else{
            mensajeSalida = "La orden de compra ya existe";
          }
        }



    }else{
      mensajeSalida = "Ingresar el número de la orden";
    }

    return mensajeSalida;
}


const guardaOrderQueue = async request => {
     //trama
    const message = JSON.stringify(request.payload.Body);
    //numOrden
    const numOrden = request.payload.Body.OrderNumber;
    
    //Valida Tipo de Orden   QUITAR
    const messageType = await validaTipoOrden(request);

    //signature    QUITAR
    const signature = uuid.v1(); 

    const envio = {request, message, messageType, numOrden, signature}; 
    var salida = {"Code":-1,"Message":"No Encontrado"};
    try{
      const resultado = await modelo.insertOrderQueue(envio);
      salida = {"Code":0,"Message":"Exito"}
    }catch(err){
      console.log(err);
      salida = {"Code":1,"Message":"Error("+err+")"}
    }

    return salida;
}

const getIdParametro = async request =>{
  //Discount
    const codParametro = "CODIGOPAIS";
    const send = {request, codParametro};
    const idParam = await modelo.getParametro(send);
    return idParam;
}

const descuentoNegativo = async request =>{
  //Discount
  var prods = request.payload.Body.Products;
  const lst = prods.filter(p => p.Discount < 0);
  return lst.length;
}

const precioNegativo = async request =>{
  var prods = request.payload.Body.Products;
  const lst = prods.filter(p => p.ListPrice <= 0);
  return lst.length;
}

const listaProductos = async request =>{
    var prods = request.payload.Body.Products;
    var objProd ={};
    var cant =0;

    if(prods.length>0){
      objProd = prods.reduce(function (lista, p) { 
        if (p.skuCode in lista) { lista[p.skuCode]++;  }
        else { lista[p.skuCode] = 1;  }
        return lista;
      }, {});
    }

    if(objProd){
      for(var o in objProd){
        cant++;
      }
    }

    return cant;
}

const validaRequest = async request =>{
  var respuesta = {
    "valido":true,
    "mensaje":"" 
  };

  const docNumber = request.payload.Body.Client.CustomerDocumentNumber;
  const fullName = request.payload.Body.Client.CustomerFullName;
  const address = request.payload.Body.Client.DispatchAddress;

  if(docNumber==null || docNumber.trim().length==0){
    respuesta.valido=false;
    respuesta.mensaje = "Cliente no tiene Número de Documento.";
  }

  if(fullName==null || fullName.trim().length==0){
    respuesta.valido=false;
    respuesta.mensaje = "Cliente no tiene Nombre.";
  }

  if(address==null || address.trim().length==0){
    respuesta.valido=false;
    respuesta.mensaje = "Cliente no tiene Dirección de Despacho.";
  }

  return respuesta;
}

const validaTipoDocumento = async request =>{
  var salida = false;
  try{

    //obtener Tipo Documento
    const flag = 2;
    const codTabla = "TIP_DOC";
    const send = {request, flag, codTabla};
    const res = await modelo.listaTablaGeneral(send);

    const descrip = res.recordset;
    const result = descrip.filter(dato => dato.COD_INTERNO.toLowerCase().trim() == 
                      request.payload.Body.Client.CustomerDocumentType.toLowerCase().trim());
     const descripcion =  result[0].DESCRIPCION;
     if(descripcion.trim().length>0){
        salida = true;
     }
    
  }catch(err){
    console.log("Error en validaTipoDocumento = "+err);
  }
  return salida;
}

const validaTipoOrden = async request =>{
  var salida = "";
  try{
    //Obtiene la descripcion
    const flag = 2;
    const codTabla = "TIPOORDEN";  
    const send = {request, flag, codTabla};
    const res = await modelo.listaTablaGeneral(send);

    const descrip = res.recordset;
    const result = descrip.filter(dato => dato.IDTABLAGENERAL == request.payload.Body.OrderTypeID);
    const descripcion =  result[0].DESCRIPCION;
    const messageType = descripcion.trim();
    salida = messageType;

  }catch(err){
    console.log("Error en validaTipoOrden = "+err);
    
  }
  return salida;
}


module.exports = {
  orderPicked
};