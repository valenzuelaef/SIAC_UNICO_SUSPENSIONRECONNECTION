using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Claro.SIACU.App.SuspensionReconnection.Areas.SuspensionReconnection.Models.DatosAdicionales
{
    public class DatosAdicionalesRequest : Tools.Entity.Request
    {
        [DataMember(Name = "MessageRequest")]
        public DatosAdicionalesMessageRequest MessageRequest { get; set; }
    }

    [DataContract(Name = "MessageRequest")]
    public class DatosAdicionalesMessageRequest
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderReq Header { get; set; }

        [DataMember(Name = "Body")]
        public DatosAdicionalesBodyRequest Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class DatosAdicionalesBodyRequest
    {
        [DataMember(Name = "customerId")]
        public string customerId { get; set; }
         
        [DataMember(Name = "canal")]
        public string canal { get; set; }

        [DataMember(Name = "idTransaccion")]
        public string IdTransaccion { get; set; }

        [DataMember(Name = "idProceso")]
        public string IdProceso { get; set; }

        [DataMember(Name = "idProducto")]
        public string IdProducto { get; set; }     

        [DataMember(Name = "contratoId")]
        public string ContratoId { get; set; }


        [DataMember(Name = "fechaDesde")]
        public string FechaDesde { get; set; }

        [DataMember(Name = "fechaHasta")]
        public string FechaHasta { get; set; }

        [DataMember(Name = "estado")]
        public string Estado { get; set; }

        [DataMember(Name = "asesor")]
        public string Asesor { get; set; }

        [DataMember(Name = "cuenta")]
        public string Cuenta { get; set; }

        [DataMember(Name = "tipoTransaccion")]
        public string TipoTransaccion { get; set; }

        [DataMember(Name = "codIteraccion")]
        public string CodIteraccion { get; set; }

        [DataMember(Name = "cadDac")]
        public string CadDac { get; set; }

        [DataMember(Name = "coId")]
        public string CoId { get; set; }
         [DataMember(Name = "interactId")]
        public string interactId { get; set; }

         [DataMember(Name = "flagConvivencia")]
         public string flagConvivencia { get; set; }
        
    }
}