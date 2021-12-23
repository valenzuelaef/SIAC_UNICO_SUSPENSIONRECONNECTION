using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Models.DatosAdicionales
{
    public class DatosAdicionalesResponse
    {
        [DataMember(Name = "MessageResponse")]
        public DatosAdicionalesMessageResponse MessageResponse { get; set; }
    }

    [DataContract(Name = "MessageResponse")]
    public class DatosAdicionalesMessageResponse
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderRes Header { get; set; }

        [DataMember(Name = "Body")]
        public DatosAdicionalesBodyResponse Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class DatosAdicionalesBodyResponse
    {
        [DataMember(Name = "codigoRespuesta")]
        public int CodigoRespuesta { get; set; }

        [DataMember(Name = "mensajeRespuesta")]
        public string MensajeRespuesta { get; set; }

        [DataMember(Name = "servicios")]
        public Servicios servicios { get; set; }
    }

    [DataContract(Name = "servicios")]
    public class Servicios
    {
        [DataMember(Name = "configuracionesfija/obtenerConfiguraciones")]
        public ConfiguracionesfijaObtenerConfiguraciones configuracionesfija_obtenerConfiguraciones { get; set; }

        [DataMember(Name = "consultatipificacion/obtenerInformacionTipificacion")]
        public TipificacionreglasObtenerInformacionTipificacion tipificacionreglas_obtenerInformacionTipificacion { get; set; }

        [DataMember(Name = "gestionprogramacionesfija/validarTareasProgramadas")]
        public GestionProgramacionesFijaValidarTareasProgramadas gestionprogramacionesfija_validarTareasProgramadas { get; set; }
        [DataMember(Name = "tipificacion/plusInter")]
        public consultatipificacionListTipificacionPlusInter consultatipificacion_ListTipificacionPlusInter { get; set; }

        [DataMember(Name = "consultatransaccionfija/validarTransaccion")]
        public ConsultatransaccionfijaValidarTransaccion consultatransaccionfija_validarTransaccion { get; set; }
    }

    [DataContract(Name = "configuracionesfija/obtenerConfiguraciones")]
    public class ConfiguracionesfijaObtenerConfiguraciones
    {
        [DataMember(Name = "idTransaccion")]
        public string TransactionID { get; set; }

        [DataMember(Name = "codigoRespuesta")]
        public string CodeResponse { get; set; }

        [DataMember(Name = "mensajeRespuesta")]
        public string MessageResponse { get; set; }

        [DataMember(Name = "transaccionProducto")]
        public TransaccionProducto ProductTransaction { get; set; }
    }

    [DataContract(Name = "consultatipificacion/obtenerInformacionTipificacion")]
    public class TipificacionreglasObtenerInformacionTipificacion
    {
        [DataMember(Name = "codigoRespuesta")]
        public string CodigoRespuesta { get; set; }

        [DataMember(Name = "mensajeRespuesta")]
        public string MensajeRespuesta { get; set; }

        [DataMember(Name = "listaTipificacionRegla")]
        public ICollection<ListaTipificacionRegla> listaTipificacionRegla { get; set; }
    }


    [DataContract(Name = "tipificacion/plusInter")]
    public class consultatipificacionListTipificacionPlusInter
    {
        [DataMember(Name = "flagConsulta")]
        public string flagConsulta { get; set; }

        [DataMember(Name = "msgText")]
        public string msgText { get; set; }

        [DataMember(Name = "listaCursor")]
        public ICollection<ListTipificacionPlusInter> listaCursor { get; set; }
    }

    [DataContract(Name = "gestionprogramacionesfija/validarTareasProgramadas")]
    public class GestionProgramacionesFijaValidarTareasProgramadas 
    { 
        
        [DataMember(Name = "idTransaccion")]
        public string IdTransaccion { get; set;}

        [DataMember(Name = "codigoRespuesta")]
        public string CodigoRespuesta { get; set; }
            
        [DataMember(Name = "mensajeRespuesta")]
        public string MensajeRespuesta { get; set;}
            
        [DataMember(Name = "cantidadTareasProgramadas")]
        public string CantidadTareasProgramadas { get; set; }

        [DataMember(Name = "listaOpcionalResponse")]
        public string ListaOpcionalResponse { get; set; }
    
    }

    [DataContract(Name = "consultatransaccionfija/validarTransaccion")]
    public class ConsultatransaccionfijaValidarTransaccion
    {
        [DataMember(Name = "responseAudit")]
        public ResponseAudit ResponseAudit { get; set; }
        [DataMember(Name = "responseData")]
        public ResponseData ResponseData { get; set; }
    }

    [DataContract(Name = "responseAudit")]
    public class ResponseAudit
    {
        [DataMember(Name = "idTransaccion")]
        public string IdTransaccion { get; set; }
        [DataMember(Name = "codigoRespuesta")]
        public string CodigoRespuesta { get; set; }
        [DataMember(Name = "mensajeRespuesta")]
        public string MensajeRespuesta { get; set; }
    }

    [DataContract(Name = "responseData")]
    public class ResponseData
    {
        [DataMember(Name = "codigo")]
        public string Codigo { get; set; }
        [DataMember(Name = "mensaje")]
        public string Mensaje { get; set; }
        [DataMember(Name = "listaOpcional")]
        public List<ListaOpcional> ListaOpcional { get; set; }
    }

    public class ListaOpcional
    {
        [DataMember(Name = "clave")]
        public string Clave { get; set; }
        [DataMember(Name = "valor")]
        public string Valor { get; set; }
    }
}