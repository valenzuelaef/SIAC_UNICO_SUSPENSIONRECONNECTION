using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Models.DatosAdicionales;
using Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Models.InitialData;
using Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Models.Transversal;

namespace Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Controllers
{
    public class HomeController : Controller
    {
        static DatosAdicionalesResponse oDatosAdi = new DatosAdicionalesResponse();
        static string stridSession;
        //static string strIpSession = Utils.Common.GetApplicationIp();
        static string strIpSession = "172.19.84.167";
        static byte[] databytesFile;

        public ActionResult Index()
        {
            return PartialView();
        }

        [HttpPost]
        public JsonResult GetInitialConfiguration(Models.InitialData.InitialDataBodyRequest oBodyRequest, string SessionID, string TransactionID)
        {

            oDatosAdi = new DatosAdicionalesResponse();
            Models.InitialData.InitialDataRequest oInitialDataRequest = new Models.InitialData.InitialDataRequest();
            Models.InitialData.AdditionalFixedDataRequest oDatosAdicionalesDataRequest = new Models.InitialData.AdditionalFixedDataRequest();
            Models.InitialData.InitialDataResponse oInitialDataResponse = new Models.InitialData.InitialDataResponse();
            Models.InitialData.AdditionalFixedDataResponse oAdditionalFixedDataResponse = new Models.InitialData.AdditionalFixedDataResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(SessionID);
            Dictionary<string, string> oConfiguraciones = new Dictionary<string, string>();
            string strUrl;

            try
            {

                    strUrl = ConfigurationManager.AppSettings["DPGetCargaDatosClienteFija"];
                    oInitialDataRequest.Audit = oAuditRequest;
                    oInitialDataRequest.MessageRequest = new Models.InitialData.InitialDataMessageRequest
                    {
                        Header = new Models.DataPower.HeaderReq
                        {
                            HeaderRequest = new Models.DataPower.HeaderRequest
                            {
                                consumer = "SIACU",
                                country = "PE",
                                dispositivo = "MOVIL",
                                language = "ES",
                                modulo = "siacu",
                                msgType = "Request",
                                operation = "obtenerDatosInicial",
                                pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                                system = "SIACU",
                                timestamp = DateTime.Now.ToString("o"),
                                userId = Utils.Common.CurrentUser,
                                wsIp = strIpSession
                            }
                        },
                        Body = new Models.InitialData.InitialDataBodyRequest
                        {
                            ContractID = oBodyRequest.ContractID,
                            CustomerID = oBodyRequest.CustomerID,
                            UserAccount = oBodyRequest.UserAccount,
                            codeRol = oBodyRequest.codeRol,
                            codeCac = oBodyRequest.codeCac,
                            state = oBodyRequest.state,
                            Type = oBodyRequest.Type,
                            flagConvivencia = ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]
                        }
                    };

                    Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Url: " + strUrl); 
                    Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Request Process 0 - SuspensionReconnection: " + JsonConvert.SerializeObject(oInitialDataRequest));
                    oInitialDataResponse = Utils.RestService.PostInvoque<Models.InitialData.InitialDataResponse>(strUrl, oInitialDataRequest.Audit, oInitialDataRequest, true);
                    Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Response Process 0 - SuspensionReconnection: " + JsonConvert.SerializeObject(oInitialDataResponse));

                    var oPointAttention = new PuntoAtencionResponse();
                    if (oInitialDataResponse.MessageResponse != null)
                {
                        if (oInitialDataResponse.MessageResponse.Body != null)
                    {
                            oPointAttention = oInitialDataResponse.MessageResponse.Body.PuntoAtencion;
                            if (oPointAttention != null)
                        {
                                if (oPointAttention.CodigoRespuesta == "0")
                            {
                                    oInitialDataResponse.MessageResponse.Body.PuntoAtencion.listaRegistros = oPointAttention.listaRegistros.OrderBy(x => x.nombre).ToList();
                            }
                        }
                }
                    }
               
                this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
                {
                    IdTransaccion = TransactionID,
                    IdProceso = Tools.Utils.Constants.numeroUno.ToString(),
                    IdProducto = oInitialDataResponse.MessageResponse.Body.CoreServices.Technology,
                    ContratoId = oBodyRequest.ContractID,
                    customerId = oBodyRequest.CustomerID
                });

                if (oDatosAdi.MessageResponse.Body.servicios.configuracionesfija_obtenerConfiguraciones.ProductTransaction != null) 
                {
                    foreach (var item in oDatosAdi.MessageResponse.Body.servicios.configuracionesfija_obtenerConfiguraciones.ProductTransaction.ConfigurationAttributes.Where(x => x.AttributeType == "CONFIGURACIONES"))
                    {
                        oConfiguraciones[item.AttributeName + "_" + item.AttributeIdentifier] = item.AttributeValue;
                    }
                }

            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(SessionID, oInitialDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oInitialDataResponse = JsonConvert.DeserializeObject<Models.InitialData.InitialDataResponse>(result);
            }

            return Json(new
            {
                oInitialDataResponse,
                oDatosAdi,
                oConfiguraciones,
                oAuditRequest
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetDatosAdicionales(DatosAdicionalesBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerDatosAcionales"];
            DatosAdicionalesRequest oDatosAcicionalesDataRequest = new DatosAdicionalesRequest();
            DatosAdicionalesResponse oDatosAcicionalesDataResponse = new DatosAdicionalesResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDatosAcicionalesDataRequest.Audit = oAuditRequest;

            oDatosAcicionalesDataRequest.MessageRequest = new DatosAdicionalesMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "SIACU",
                        country = "PE",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "siacu",
                        msgType = "Request",
                        operation = "obtenerDatosInicial",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession 
                    }
                },
                Body = new DatosAdicionalesBodyRequest
                {
                    IdTransaccion = request.IdTransaccion,
                    IdProceso = request.IdProceso,
                    IdProducto = request.IdProducto,
                    ContratoId = request.ContratoId,
                    FechaDesde = string.Empty,
                    FechaHasta = string.Empty,
                    Estado = string.Empty,
                    Asesor = string.Empty,
                    Cuenta = string.Empty,
                    TipoTransaccion = string.Empty,
                    CodIteraccion = string.Empty,
                    CadDac = string.Empty,
                    CoId =  request.ContratoId,
                    interactId = request.interactId,
                    customerId = request.customerId,
                    flagConvivencia = ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]
                }
            };

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Url: " + strUrl); 
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Request Process 1 - SuspensionReconnection: " + JsonConvert.SerializeObject(oDatosAcicionalesDataRequest));
                oDatosAcicionalesDataResponse = Utils.RestService.PostInvoque<DatosAdicionalesResponse>(strUrl, oDatosAcicionalesDataRequest.Audit, oDatosAcicionalesDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Response Process 1 - SuspensionReconnection: " + JsonConvert.SerializeObject(oDatosAcicionalesDataResponse));
                oDatosAdi = oDatosAcicionalesDataResponse;
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDatosAcicionalesDataResponse = JsonConvert.DeserializeObject<Models.DatosAdicionales.DatosAdicionalesResponse>(result);
            }

            return Json(new
            {data = oDatosAcicionalesDataResponse
            }, 
            JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult postGeneraTransaccion(GuardarDatosDataBodyRequest request, string TransactionID)
        {
            request.idFlujo = TransactionID == Tools.Utils.Constants.NumberSixString ? ConfigurationManager.AppSettings["IdFlujoSuspensionReconexionFTTH"] : ConfigurationManager.AppSettings["IdFlujoSuspensionReconexionFTTHONE"];         
            string strUrl = ConfigurationManager.AppSettings["DPGetGuardarDatosAgendamiento"];
            Models.Transversal.GuardarDatosRequest oDataRequest = new Models.Transversal.GuardarDatosRequest();
            Models.Transversal.GuardarDatosResponse oDataResponse = new Models.Transversal.GuardarDatosResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);
            string record = string.Empty;

            oDataRequest.Audit = oAuditRequest;

            oDataRequest.MessageRequest = new Models.Transversal.GuardarDatosDataMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "SIACU",
                        country = "PE",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "siacu",
                        msgType = "Request",
                        operation = "guardardatosagendamiento",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.Transversal.GuardarDatosDataBodyRequest
                {
                    idFlujo = request.idFlujo,
                    Servicios = request.Servicios
                }
            };

            request.Servicios.Select(m => new Models.Transversal.Servicios
            {
                Servicio = m.Servicio,
                parametros = m.parametros.Where(u => u.valor == null).ToList()
            }).ToList().ForEach(y =>
            {
                foreach (var item in y.parametros)
                {
                    item.valor = "";
                }
            });
 
            //Encriptamos a base64 la notas -  Tipificacion
            request.Servicios.Where(m => m.Servicio == "Tipificacion")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "Notas").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la inter_30 - Tipificacion
            request.Servicios.Where(m => m.Servicio == "Plantilla")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "inter30").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 las Tareas Pogramadas
            request.Servicios.Where(m => m.Servicio == "TareasPogramadas")
               .Select(m => new Models.Transversal.Servicios
               {
                   Servicio = m.Servicio,
                     parametros = m.parametros.Where(u => u.parametro == "listaRegistro").ToList()
               }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));


            request.Servicios.Where(m => m.Servicio == "Constancia")
                .Select(m => new Models.Transversal.Servicios
                {
                    Servicio = m.Servicio,
                    parametros = m.parametros.Where(u => u.parametro == "DRIVE_CONSTANCIA").ToList()
                })
               .ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            try
            {
                databytesFile = null;
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl); 
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request DP PostSuspensionReconecction: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.Transversal.GuardarDatosResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response DP PostSuspensionReconecction: " + JsonConvert.SerializeObject(oDataResponse));
                record = (oDataResponse.MessageResponse.Body.constancia == null) ? "" : oDataResponse.MessageResponse.Body.constancia;
                databytesFile = Convert.FromBase64String(record);
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<Models.Transversal.GuardarDatosResponse>(result);
            }

            return Json(new
            {
                data = oDataResponse,
            }, JsonRequestBehavior.AllowGet);
        }

        public FileContentResult ShowRecordSharedFile(string strIdSession)
        {
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
            byte[] databytes;
            string strContenType = "application/pdf";

            try
            {
                Tools.Entity.AuditRequest oAudit = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
                databytes = databytesFile;
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(strIdSession, oAuditRequest.Transaction, ex.Message);
                databytes = null;
            }

            return File(databytes, strContenType);
        }

	}
}