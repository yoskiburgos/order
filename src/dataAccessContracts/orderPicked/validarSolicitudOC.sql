EXECUTE  [dbo].[WS_SOL_ValidarSolicitudOC_PICKING] 
   @numOrden
  ,@codigo OUTPUT
  ,@mensaje OUTPUT;

select @codigo as CODIGO, @mensaje as MENSAJE;
