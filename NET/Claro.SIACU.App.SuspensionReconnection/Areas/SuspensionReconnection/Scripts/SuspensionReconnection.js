(function ($, undefined) {

    'use strict';
    var Form = function ($element, options) {
        $.extend(this, $.fn.form.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            divMainBody: $('#navbar-body'),
            divMainHeader: $('#main-header'),
            divMainFooter: $('#main-footer'),
            idSession: $('#idSession'),
            btnSave: $('#btn-save', $element),
            btnConstancy: $('#btn-constancy', $element),
            ddlCenterofAttention: $('#ddlCenterofAttention', $element),
            txtImporPagar: $('#txtImporPagar', $element),
            spnAttetionRules: $('#spnAttetionRules', $element),
            ErrorMessageddlCenterofAttention: $('#ErrorMessageddlCenterofAttention', $element),
            calendarFecSus: $('#calendarFecSus', $element),
            calendarFecReac: $('#calendarFecReac', $element),
            chkRetencion: $('#chkRetencion', $element),
            chkSendMail: $('#chkSendMail', $element),
            txtSendMail: $('#txtSendMail', $element),
            txtNotas: $('#txtNotas', $element),
            ErrorMessagetxtSendMail: $('#ErrorMessagetxtSendMail', $element)
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {
            var that = this,
                controls = that.getControls();

            moment.locale('es');
            that.reloj();
            that.render();
        },

        render: function () {
            var that = this,
                controls = that.getControls();

            controls.btnSave.addEvent(that, 'click', that.btnSave_Click);
            controls.btnConstancy.addEvent(that, 'click', that.btnConstancy_Click);
            controls.chkSendMail.addEvent(that, 'change', that.chkSendMail_Click);
            controls.chkRetencion.addEvent(that, 'change', that.chkRetencion_change);
            $('#calendarFecSus').change(function () {
                if (!that.validaFechas()) {
                    $("#calendarFecSus").val("");
                    return false;
                }
                that.loadInformApportionment();
            });
            $("#calendarFecReac").change(function () {
                if (!that.validaFechas()) {
                    $("#calendarFecReac").val("");
                    return false;
                }
                that.loadInformApportionment();
            });
            controls.ddlCenterofAttention.addEvent(that, 'change', that.ddlCenterOfAttention_change);
            controls.txtSendMail.addEvent(that, 'keyup', that.emailValidation);
            that.initialConfiguration();
        },

        getControls: function () {
            return this.m_controls || {};
        },

        setControls: function (value) {
            this.m_controls = value;
        },

        reloj: function () {
            var that = this,
                controls = that.getControls();

            that.resizeContent();
            var text2 = moment().format('DD/MM/YYYY hh:mm:ss a');
            controls.idSession.html('Session ID : ' + Session.UrlParams.IdSession + '&nbsp&nbsp  ' + text2 + '');
            var t = setTimeout(function () { that.reloj() }, 500);
        },

        resizeContent: function () {
            var controls = this.getControls();
            controls.divMainBody.css('height', $(window).outerHeight() - controls.divMainHeader.outerHeight() - controls.divMainFooter.outerHeight());
        },

        btnSave_Click: function () {
            var that = this,
                controls = that.getControls();

            if (!that.validaCamposFechas()) {
                return false;
            }

            if (!that.validarInteraccion()) {
                return false;
            }

            if (!that.onFocusoutEmail()) {
                return false;
            }

            if (!that.validarCentroDeAtencion()) {
                return false;
            }

            if (!that.comparacionPorRetencion()) {
                return false;
            }

            confirm("¿Está seguro de guardar los cambios?", null, function () {
                that.getLoadingPage();
                try {
                    var idProgramTaskSusp = '',
                        idProgramTaskReco = '';

                    if (that.IsEditProgramTask()) {
                        idProgramTaskSusp = that.getUrlParameter('idTasksSups');
                        idProgramTaskReco = that.getUrlParameter('idTasksReco');
                    }

                    that.saveTransaction(idProgramTaskSusp, idProgramTaskReco);
                }
                catch (ex) {
                    alert("No se pudo ejecutar la transacción. Informe o vuelva a intentar. " + ex, "Alerta");
                    $.unblockUI();
                }

            }, null, null);
        },

        btnConstancy_Click: function () {
            var that = this;
            var params = ['height=600',
               'width=750',
               'resizable=yes',
               'location=yes'
            ].join(',');
            var strIdSession = Session.UrlParams.IdSession;

            if (that.TransactionSession.Data.Constancia)
                window.open('/SuspensionReconnection/Home/ShowRecordSharedFile' + "?&strIdSession=" + strIdSession, "_blank", params);
            else
                alert('Ocurrió un error al generar la constancia.');

        },

        chkSendMail_Click: function (sender, arg) {

            var that = this;
            var controls = that.getControls();
            if (controls.chkSendMail.prop("checked")) {

                controls.chkSendMail.prop("checked", true);
                controls.txtSendMail.attr('disabled', false);
                controls.txtSendMail.val(that.TransactionSession.Data.CustomerInformation.Email);

            }
            else {
                controls.chkSendMail.prop("checked", false);
                controls.txtSendMail.attr('disabled', true);
            }
        },

        chkRetencion_change: function () {
            var that = this,
                controls = that.getControls();
            that.TransactionSession.flgRetencion = {};

            if (controls.chkRetencion.is(":checked")) {
                controls.txtImporPagar.val("0.00");
                controls.txtImporPagar.attr('disabled', true);
                that.TransactionSession.flgRetencion = "1";//that.TransactionSession.flgRetencion = "0"; - Validar con Equipo Alfredo Yi
            } else {
                var imp = that.TransactionSession.Data.Configuration.Constantes_FixedAmount;
                controls.txtImporPagar.val(imp);
                controls.txtImporPagar.attr('disabled', false);
                that.TransactionSession.flgRetencion = "0";//that.TransactionSession.flgRetencion = "1"; - Validar con Equipo Alfredo Yi
            }
        },

        ddlCenterOfAttention_change: function () {
            var coa = $('#ddlCenterofAttention').val();

            if (coa == '' || coa == null) {
                $('#ddlCenterofAttention').closest('.form-control').addClass('has-error');
                $('#ErrorMessageddlCenterofAttention').text('Seleccione punto de atención.');
                $('#ddlCenterofAttention').focus();
                return false;
            } else {
                $('#ErrorMessageddlCenterofAttention').closest('.form-control').removeClass('has-error');
                $('#ErrorMessageddlCenterofAttention').text('');
            }
        },

        emailValidation: function () {
            var that = this,
                controls = that.getControls();

            controls.ErrorMessagetxtSendMail.closest('.form-control').removeClass('has-error');
            controls.ErrorMessagetxtSendMail.text('');

            return true;
        },

        onFocusoutEmail: function () {
            var that = this,
                controls = this.getControls();

            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            if (controls.chkSendMail.is(':checked')) {
                if (!filter.test(controls.txtSendMail.val())) {
                    controls.txtSendMail.closest('.form-control').addClass('has-error');
                    controls.ErrorMessagetxtSendMail.text('Ingrese una dirección de correo válida.');
                    controls.txtSendMail.focus();
                    return false;
                }
                else {
                    controls.ErrorMessagetxtSendMail.closest('.form-control').removeClass('has-error');
                    controls.ErrorMessagetxtSendMail.text('');
                    return true;
                }
            }

            return true;
        },

        validaFechas: function () {
            var that = this,
                controls = that.getControls(),
                fechaSus = $("#calendarFecSus").val(),
                fechaRea = $("#calendarFecReac").val();

            fechaSus = fechaSus.substr(6, 4) + "/" + fechaSus.substr(3, 2) + "/" + fechaSus.substr(0, 2);
            fechaRea = fechaRea.substr(6, 4) + "/" + fechaRea.substr(3, 2) + "/" + fechaRea.substr(0, 2);
            var fsus = new Date(fechaSus);
            var frea = new Date(fechaRea);
            var today = new Date();

            if (fsus <= today && !that.IsEditProgramTask()) {
                alert("La fecha de suspensión debe ser mayor al día de hoy", "Alerta");
                return false;
            }

            if (frea <= fsus && !that.IsEditProgramTask()) {
                alert("La fecha de suspensión debe ser menor a la fecha de reactivación", "Alerta");
                return false;
            }

            var oneDay = 24 * 60 * 60 * 1000;
            var diffDays = Math.round(Math.abs((fsus.getTime() - frea.getTime()) / (oneDay)));

            /*Con Retencion*/
            var MaxDiasRetSuspension = that.TransactionSession.Data.Configuration.Constantes_MaxDiasRetSuspension;//2
            var MinDiasRetSuspension = that.TransactionSession.Data.Configuration.Constantes_MinDiasRetSuspension;//90
            /*Sin Retencion*/
            var MinDiasSuspension = that.TransactionSession.Data.Configuration.Constantes_DiasMinSuspension;//2
            var MaxDiasSuspension = that.TransactionSession.Data.Configuration.Constantes_MaxDiasSuspension;//62
            if ($('#chkRetencion').is(":checked")) {
                //Con Retencion
                if (diffDays < MinDiasRetSuspension && !that.IsEditProgramTask()) {
                    alert("La fecha de suspensión por retención debe ser por lo menos menor por " + MinDiasRetSuspension + " días de la fecha de reactivación", "Alerta");
                    return false;
                }
                if (diffDays > MaxDiasRetSuspension && !that.IsEditProgramTask()) {
                    alert("El periodo máximo de suspensión por retención no puede superar a los " + MaxDiasRetSuspension + " días. No es posible realizar la transacción.", "Alerta");
                    return false;
                } else {
                    return true;
                }
            }
            else {
                //Sin Retencion
                if (diffDays < MinDiasSuspension && !that.IsEditProgramTask()) {
                    alert("La fecha de suspensión debe ser por lo menos menor por " + MinDiasSuspension + " días de la fecha de reactivación", "Alerta");
                    return false;
                }

                if (diffDays > MaxDiasSuspension && !that.IsEditProgramTask()) {
                    alert("El período mínimo y máximo de Suspensión es de " + MinDiasSuspension + " y " + MaxDiasSuspension + " días respectivamente. No es posible realizar la transacción.", "Alerta");
                    return false;
                } else {
                    return true;
                }
            }

            return true;
        },

        TransactionSession: {},

        initialConfiguration: function () {

            $('#divChkRetencion').css('display', 'block');

            var that = this,
                controls = that.getControls();
            debugger;

            var plataformaAT = !$.string.isEmptyOrNull(Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT) ? Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT : '';
            var idTransactionFront = $.app.getTypeClientAsIsOrToBe(plataformaAT, '6', '14');
            $.app.transactionInitialConfigurationPromise(Session.SessionParams, idTransactionFront)
                .then(function (res) {
                    var
                        initialConfiguration = (res.oInitialDataResponse.MessageResponse != null) ? res.oInitialDataResponse.MessageResponse.Body : null,
                        AdditionalFixedData = (res.oDatosAdi.MessageResponse != null) ? res.oDatosAdi.MessageResponse.Body : null,
                        AuditRequest = res.oAuditRequest,
                        Configuraciones = res.oConfiguraciones,

                        AdditionalServices = initialConfiguration.AdditionalServices || {},
                        Igv = initialConfiguration.Igv,
                        CoreServices = initialConfiguration.CoreServices || {},
                        CustomerInformation = initialConfiguration.CustomerInformation || {},
                        PuntoAtencion = initialConfiguration.PuntoAtencion || {},
                        DatosUsuarioCtaRed = initialConfiguration.obtenerDatosUsuarioCuentaRed || {},
                        OficinaVentaUsuario = initialConfiguration.obtenerOficinaVentaUsuario || {},

                        ValidarTransaccion = AdditionalFixedData.servicios.consultatransaccionfija_validarTransaccion || {},

                        AuditRequest = AuditRequest || {};

                    that.TransactionSession.Data = {};
                    if (AdditionalFixedData != null) {
                        var
                            Configuration = AdditionalFixedData.servicios.configuracionesfija_obtenerConfiguraciones || {},
                            Tipificacion = AdditionalFixedData.servicios.tipificacionreglas_obtenerInformacionTipificacion || {},
                            Programacion = AdditionalFixedData.servicios.gestionprogramacionesfija_validarTareasProgramadas || {};

                        that.TransactionSession.Data.Configuration = (Configuration.CodeResponse == '0') ? Configuraciones : [];
                        that.TransactionSession.Data.Tipificacion = (Tipificacion.CodigoRespuesta == '0') ? Tipificacion.listaTipificacionRegla : [];
                        that.TransactionSession.Data.Programacion = Programacion;

                        that.TransactionSession.Data.ValidarTransaccion = (ValidarTransaccion.ResponseAudit.CodigoRespuesta == '0') ? ValidarTransaccion.ResponseData : [];

                        that.TransactionSession.Data.Configuration.Constante_Producto = Configuration.ProductTransaction.Producto;

                    }
                    else {
                        alert("Ocurrió un error cargar la transacción , por favor, reintente nuevamente más tarde.");
                        $('#navbar-body').showMessageErrorLoadingTransaction();
                        return false;
                    }

                    that.TransactionSession.Data.idTransactionFront = idTransactionFront;
                    that.TransactionSession.Data.plataformaAT = plataformaAT;
                    that.TransactionSession.Data.CoreServices = (CoreServices.CodeResponse == '0') ? CoreServices.ServiceList : [];
                    that.TransactionSession.Data.CoreServices.Technology = (CoreServices.CodeResponse == '0') ? CoreServices.Technology : [];
                    that.TransactionSession.Data.AdditionalServices = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalServiceList : [];
                    that.TransactionSession.Data.AdditionalEquipment = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalEquipmentList : [];
                    that.TransactionSession.Data.ListIgv = (Igv.CodeResponse == '0') ? Igv.listaIGV : [];
                    that.TransactionSession.Data.CustomerInformation = (CustomerInformation.CodeResponse == '0') ? CustomerInformation.CustomerList[0] : [];
                    that.TransactionSession.Data.PuntoAtencion = (PuntoAtencion.CodigoRespuesta == '0') ? PuntoAtencion.listaRegistros : [];
                    that.TransactionSession.Data.DatosUsuarioCtaRed = (DatosUsuarioCtaRed.CodigoRespuesta == '0') ? DatosUsuarioCtaRed.listaDatosUsuarioCtaRed : [];
                    that.TransactionSession.Data.OficinaVentaUsuario = (OficinaVentaUsuario.CodigoRespuesta == '0') ? OficinaVentaUsuario.listaOficinaVenta : [];
                    that.TransactionSession.Data.AuditRequest = AuditRequest;

                    that.SetConfig();

                    that.chkRetencion_change();

                    $.reusableBusiness.getIgv(that.TransactionSession.Data.ListIgv, function (igv) {

                        that.TransactionSession.Data.Configuration.Constantes_Igv = igv;

                        // Load Customer Information - Left Panel
                        // if (that.transactionData.Data.CustomerInformation != null  && that.transactionData.Data.CustomerInformation.length > 0)
                        if (!$.array.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation))
                            $.app.renderCustomerInformation(that.TransactionSession);

                        // Load Core Service Information - Left Panel
                        //if (that.transactionData.Data.CoreServices != null && that.TransactionSession.Data.CoreServices.length > 0)
                        if (!$.array.isEmptyOrNull(that.TransactionSession.Data.CoreServices))
                            $.app.renderCoreServices(that.TransactionSession);

                        // Load Additional Service Information - Left Panel
                        //if (that.transactionData.Data.AdditionalServices != null && that.TransactionSession.Data.AdditionalServices.length > 0)
                        if (!$.array.isEmptyOrNull(that.TransactionSession.Data.AdditionalServices))
                            $.app.renderAdditionalServices(that.TransactionSession);

                        // Load Additional Equipment Information - Left Panel
                        // if (that.transactionData.Data.AdditionalEquipment != null && that.TransactionSession.Data.AdditionalEquipment.length > 0)
                        if (!$.array.isEmptyOrNull(that.TransactionSession.Data.AdditionalEquipment))
                            $.app.renderAdditionalEquipment(that.TransactionSession);

                    });
                    /***INI-Nuevas configuraciones***/
                    that.TransactionSession.Data.Configuration.Programacion_flgReingenieria = '1';
                    //that.TransactionSession.Data.Configuration.Programacion_CodMotot = idTransactionFront =='6'?that.TransactionSession.Data.Configuration.Programacion_CodMotot : 'CONFIRMAR'; 
                    that.TransactionSession.Data.Configuration.Plataforma_Facturador = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? 'BSCS7' : 'CBIO';
                    //that.TransactionSession.Data.Configuration.Programacion_Reason = idTransactionFront == '6' ? 'BSCS7' : 'CBIO';
                    that.TransactionSession.Data.Configuration.Programacion_Reason_Suspension = idTransactionFront == '6' ? that.TransactionSession.Data.Configuration.Programacion_Reason : '2007';
                    that.TransactionSession.Data.Configuration.Programacion_Reason_Reconexion = idTransactionFront == '6' ? that.TransactionSession.Data.Configuration.Programacion_Reason : '2012';
                    debugger;

                    if (that.TransactionSession.Data.CoreServices.Technology == "9") {
                        that.TransactionSession.Data.Configuration.Programacion_TipTraSus = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? that.TransactionSession.Data.Configuration.Programacion_TipTraSus : '1087';
                        that.TransactionSession.Data.Configuration.Programacion_TipTraRec = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? that.TransactionSession.Data.Configuration.Programacion_TipTraRec : '1088';
                    }
                    if (that.TransactionSession.Data.CoreServices.Technology == "5") {
                        that.TransactionSession.Data.Configuration.Programacion_TipTraSus = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? that.TransactionSession.Data.Configuration.Programacion_TipTraRec : '1102';//Programacion_TipTraSus es el mismo REeact hay para AS Is
                        that.TransactionSession.Data.Configuration.Programacion_TipTraRec = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? that.TransactionSession.Data.Configuration.Programacion_TipTraRec : '1101';
                        //that.TransactionSession.Data.Configuration.Programacion_TipTraSus = that.TransactionSession.Data.Configuration.Programacion_TipTraRec ;
                        // that.TransactionSession.Data.Configuration.Programacion_TipTraRec = that.TransactionSession.Data.Configuration.Programacion_TipTraRec ;
                    }
                    console.log('Technology: ' + that.TransactionSession.Data.CoreServices.Technology)
                    console.log('Programacion_TipTraSus: ' + that.TransactionSession.Data.Configuration.Programacion_TipTraSus)
                    console.log('Programacion_TipTraRec: ' + that.TransactionSession.Data.Configuration.Programacion_TipTraRec)
                    /***FIN-Nuevas configuraciones***/

                    $.reusableBusiness.LoadPointOfAttention(controls.ddlCenterofAttention, that.TransactionSession);
                    var Rango = that.TransactionSession.Data.Configuration.Constantes_MaxDiasSuspension * 1;
                    var numMaxDias = '+' + Rango + 'd';
                    controls.calendarFecSus.datepicker({ format: 'dd/mm/yyyy', todayHighlight: true, startDate: '+0d', endDate: numMaxDias });
                    controls.calendarFecReac.datepicker({ format: 'dd/mm/yyyy', todayHighlight: true, startDate: '+0d', endDate: numMaxDias });

                    /*Edit Program Task*/
                    if (that.IsEditProgramTask()) {
                        that.LoadEditProcess(that.TransactionSession.Data.idTransactionFront, '2');
                    }
                    else {
                        if (!that.InitialValidation()) {
                            return false;
                        }
                    }

                })
                .catch(function (e) {

                    alert(string.format('Ocurrio un error al cargar la transacción - {0}', e));
                    $('#navbar-body').showMessageErrorLoadingTransaction();
                })
                .then(function () {

                    $.unblockUI();
                });
        },
        IsEditProgramTask: function () {
            var that = this;

            if (!that.IsNullOrEmpty(that.getUrlParameter('mode')) &&
                !that.IsNullOrEmpty(that.getUrlParameter('type')))
                return true

            return false
        },
        IsNullOrEmpty: function (data) {

            if (data == null || data == '' || data == undefined || data.length == 0)
                return true;

            return false;
        },
        LoadEditProcess: function (idTransaccion, proceso) {

            var that = this,
               controls = that.getControls();
            var oRequest = {
                IdTransaccion: idTransaccion,
                IdProceso: proceso,
                IdProducto: that.TransactionSession.Data.CoreServices.Technology,
                ContratoId: Session.SessionParams.DATACUSTOMER.ContractID,
                interactId: that.getUrlParameter('mode')
            };

            console.log(that.TransactionSession.Data);
            console.log(oRequest);

            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(oRequest),
                url: '/SuspensionReconnection/Home/GetDatosAdicionales',
                success: function (response) {


                    if (response.data.MessageResponse.Body.servicios != null) {

                        if (!that.IsNullOrEmpty(response.data.MessageResponse.Body.servicios.consultatipificacion_ListTipificacionPlusInter))

                            if (!that.IsNullOrEmpty(response.data.MessageResponse.Body.servicios.consultatipificacion_ListTipificacionPlusInter.listaCursor))
                                that.LoadProcessResponse(response.data.MessageResponse.Body.servicios.consultatipificacion_ListTipificacionPlusInter.listaCursor);
                            else {
                                alert('No se encontraron datos de la tarea programada a editar.', 'Alerta', function () {
                                    $.unblockUI();
                                    parent.window.close();
                                });
                            }

                        else {
                            alert('No se encontraron datos de la tarea programada a editar.', 'Alerta', function () {
                                $.unblockUI();
                                parent.window.close();
                            });
                        }
                    }
                    else {
                        alert('Error al consultar los datos de la tarea programada.', 'Alerta', function () {
                            $.unblockUI();
                            parent.window.close();
                        });
                    }
                },
                error: function (err) {
                    alert('Ocurrió un error al tratar de consultar los datos de la tarea programada.', 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                }
            });
        },
        getUrlParameter: function (sParam) {
            var sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
                }
            }
        },
        LoadProcessResponse: function (data) {
            var that = this,
               controls = that.getControls(),
               tipTransaccion = that.getUrlParameter('type');

            controls.txtImporPagar.val(data[0].xInter7);
            if (data[0].xInter3 == '1')
                controls.chkRetencion.prop("checked", true);
            else
                controls.chkRetencion.prop("checked", false);

            controls.calendarFecSus.val(data[0].xInter1);
            controls.calendarFecReac.val(data[0].xInter2);
            $("#ddlCenterofAttention option:contains(" + data[0].xInter15 + ")").attr('selected', true);
            controls.txtNotas.val(data[0].xInter30);
            switch (tipTransaccion) {
                case '3':
                    controls.calendarFecReac.prop('disabled', true);
                    break;
                case '4':
                    controls.calendarFecSus.prop('disabled', true);
                    break;
                default:
                    break;
            }
            return true;
        },


        SetConfig: function () {
            var that = this,
                controls = that.getControls();

            controls.txtImporPagar.val(that.TransactionSession.Data.Configuration.Constantes_FixedAmount);
            controls.spnAttetionRules.append((that.TransactionSession.Data.Tipificacion.length > 0) ? that.TransactionSession.Data.Tipificacion[0].Regla : "");
            controls.txtSendMail.val(that.TransactionSession.Data.CustomerInformation.Email);

        },

        InitialValidation: function () {

            var that = this,
               controls = that.getControls(),
               stateContract = !$.string.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation.ContractStatus) ? that.TransactionSession.Data.CustomerInformation.ContractStatus : '',
               stateService = !$.string.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation.ServiceStatus) ? that.TransactionSession.Data.CustomerInformation.ServiceStatus : '';
            console.log('stateContract: ' + stateContract);
            console.log('stateService:  ' + stateService);
            console.log('Plataforma:  ' + Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT);
            //Checking the status of the contract
            if (Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE') {
                if (stateContract.trim().toUpperCase() != 'ACTIVO' || stateService.trim().toUpperCase() != 'ACTIVO') {
                    alert(that.TransactionSession.Data.Configuration.Constantes_MsgLineaStatSuspe, 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });

                    return false;
                }
            }
            else {
                if (stateContract.trim().toUpperCase() != 'ACTIVO') {
                    alert("El contrato no se encuentra activo.", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }
            }

            //Checking for scheduled tasks.
            if (that.TransactionSession.Data.Programacion.CodigoRespuesta == '0') {
                var tareas = that.TransactionSession.Data.Programacion.CantidadTareasProgramadas;
                if (tareas != null || tareas != undefined) {
                    if (tareas.trim() != "0") {
                        alert(that.TransactionSession.Data.Configuration.Constantes_MsgLineaPOTP, 'Alerta', function () {
                            $.unblockUI();
                            parent.window.close();
                        });

                        return false;
                    }
                } else {
                    alert('Hubo un error al validar las transacciones anteriores. Informe o vuelva a intentar', 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });

                    return false;
                }
            } else {
                alert(that.TransactionSession.Data.Configuration.Constantes_MsgLineaPOTP, 'Alerta', function () {
                    $.unblockUI();
                    parent.window.close();
                });

                return false;
            }


            if (!$.array.isEmptyOrNull(that.TransactionSession.Data.ValidarTransaccion)) {
                if (that.TransactionSession.Data.ValidarTransaccion.Codigo == "-3") {
                    alert(that.TransactionSession.Data.ValidarTransaccion.Mensaje, 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

                if (that.TransactionSession.Data.ValidarTransaccion.Codigo == "-1") {
                    alert("Error al validar transacción", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

            }


            return true;
        },

        validarInteraccion: function () {
            var strNotas = $('#txtNotas').val();

            if (strNotas.length > 3800) {
                alert('El campo Notas solo acepta 3800 caracteres', 'Alerta');
                $('#txtNotas').val(strNotas.substring(0, 3800));
                return false;
            }

            return true;
        },

        validaCamposFechas: function () {
            var that = this;

            that.fechaSuspension = $("#calendarFecSus").val();
            that.fechaReactivacion = $("#calendarFecReac").val();

            that.fechaSuspension = that.fechaSuspension.substr(6, 4) + "/" + that.fechaSuspension.substr(3, 2) + "/" + that.fechaSuspension.substr(0, 2);
            that.fechaReactivacion = that.fechaReactivacion.substr(6, 4) + "/" + that.fechaReactivacion.substr(3, 2) + "/" + that.fechaReactivacion.substr(0, 2);

            if (that.fechaSuspension == "//" || that.fechaReactivacion == "//") {
                alert("Necesita seleccionar las fechas de suspensión y reactivación");
                return false;
            }
            return true;
        },

        validarCentroDeAtencion: function () {
            var that = this,
                controls = that.getControls();

            if (controls.ddlCenterofAttention.val() == '') {
                controls.ddlCenterofAttention.closest('.form-control').addClass('has-error');
                controls.ErrorMessageddlCenterofAttention.text('Seleccione punto de atención.');
                controls.ddlCenterofAttention.focus();
                return false;
            } else {
                controls.ErrorMessageddlCenterofAttention.closest('.form-control').removeClass('has-error');
                controls.ErrorMessageddlCenterofAttention.text('');
                return true;
            }
        },

        comparacionPorRetencion: function () {
            var that = this,
                controls = that.getControls(),
                fsus = new Date(that.fechaSuspension),
                frea = new Date(that.fechaReactivacion);

            if ($('#chkRetencion').is(":checked")) {
                if (that.dateDiff(fsus, frea) > that.TransactionSession.Data.Configuration.Constantes_SusxReten) {
                    alert(that.TransactionSession.Data.Configuration.Constantes_MensajeSusxReten, 'Alerta');
                    return false;
                }
            }
            else {
                if (that.dateDiff(fsus, frea) < that.TransactionSession.Data.Configuration.Constantes_MinSus) {
                    alert(that.TransactionSession.Data.Configuration.Constantes_MensajeMinSus, 'Alerta');
                    return false;
                }
                if (that.dateDiff(fsus, frea) > that.TransactionSession.Data.Configuration.Constantes_MaxSus) {
                    alert(that.TransactionSession.Data.Configuration.Constantes_MensajeMaxSus, 'Alerta');
                    return false;
                }

            }
            return true;
        },

        dateDiff: function (fdate, sdate) {
            var oneDay = 24 * 60 * 60 * 1000,
                diffDays = Math.round(Math.abs((fdate.getTime() - sdate.getTime()) / (oneDay)));

            return diffDays;
        },

        fechaSuspension: "",

        fechaReactivacion: "",

        getFechaActual: function () {
            var that = this;
            var d = new Date();
            var FechaActual = that.AboveZero(d.getDate()) + "/" + (that.AboveZero(d.getMonth() + 1)) + "/" + d.getFullYear();
            return FechaActual;
        },

        AboveZero: function (i) {
            if (i < 10) {
                i = '0' + i;
            }
            return i;
        },

        getHoraActual: function () {
            var that = this;
            var d = new Date();
            var HoraActual = that.AboveZero(d.getHours()) + ":" + (that.AboveZero(d.getMinutes() + 1)) + ":" + d.getSeconds();
            return HoraActual;
        },

        getLoadingPage: function () {
            var strUrlLogo = window.location.protocol + '//' + window.location.host + '/Content/images/SUFija/loading_Claro.gif';
            $.blockUI({
                message: '<div align="center"><img src="' + strUrlLogo + '" width="25" height="25" /> Cargando ... </div>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff',
                }
            });
        },

        getXMLTareaProgramada: function (strTarea, idProgramTask) {

            var that = this,
                controls = that.getControls(),
                sDate = new Date(that.fechaSuspension),
                rDate = new Date(that.fechaReactivacion),
                fideliza = $('#chkRetencion').prop("checked") ? "1" : "0",
                ndrdias = that.dateDiff(sDate, rDate),
                strXml = "", strXmlNodeP = "", desTickler = "", monto = "", costate, tDate, signo, tiptra, reason;

            signo = '<';

            if (strTarea == "sus") {
                strXmlNodeP = "<BESuspension>";
                costate = that.TransactionSession.Data.Configuration.Programacion_CodigoSuspension;
                tDate = controls.calendarFecSus.val();
                tiptra = that.TransactionSession.Data.Configuration.Programacion_TipTraSus;
                desTickler = signo + "desTickler>" + that.TransactionSession.Data.Configuration.Programacion_DesTickler + "</desTickler>";
                reason = signo + "reason>" + that.TransactionSession.Data.Configuration.Programacion_Reason_Suspension + "</reason>";
            }

            if (strTarea == "rec") {
                strXmlNodeP = "<BEReconexion>";
                costate = that.TransactionSession.Data.Configuration.Programacion_CodigoReconexion;
                tDate = controls.calendarFecReac.val();
                tiptra = that.TransactionSession.Data.Configuration.Programacion_TipTraRec;
                monto = signo + "montoOCC>" + controls.txtImporPagar.val() + "</montoOCC>";
                reason = signo + "reason>" + that.TransactionSession.Data.Configuration.Programacion_Reason_Reconexion + "</reason>";
            }

            strXml = strXmlNodeP;
            strXml += signo + "codigoAplicacion>" + that.TransactionSession.Data.Configuration.Programacion_Aplicacion + "</codigoAplicacion>";
            strXml += signo + "ipAplicacion>" + that.TransactionSession.Data.AuditRequest.IPAddress + "</ipAplicacion>";
            strXml += signo + "fechaProgramacion>" + that.getFechaActual() + "</fechaProgramacion>";
            strXml += signo + "coId>" + that.TransactionSession.Data.CustomerInformation.ContractNumber + "</coId>";
            strXml += signo + "nroDias>" + ndrdias + "</nroDias>";
            strXml += signo + "fideliza>" + fideliza + "</fideliza>";
            strXml += signo + "fechaSuspension>" + tDate + "</fechaSuspension>";
            strXml += desTickler;
            strXml += signo + "usuario>" + Session.SessionParams.USERACCESS.login + "</usuario>";
            strXml += signo + "codCliente>" + that.TransactionSession.Data.CustomerInformation.CustomerID + "</codCliente>";
            strXml += signo + "coState>" + costate + "</coState>";
            //strXml += signo + "reason>" + that.TransactionSession.Data.Configuration.Programacion_Reason + "</reason>";
            strXml += reason;
            strXml += signo + "telefono/>";
            strXml += signo + "tipoServicio/>";
            strXml += signo + "coSer>" + that.TransactionSession.Data.Configuration.Programacion_Coser + "</coSer>";
            strXml += signo + "tipoRegistro/>";
            strXml += signo + "usuarioSistema>" + "USRPVU" + "</usuarioSistema>";
            strXml += signo + "usuarioApp>" + Session.SessionParams.USERACCESS.login + "</usuarioApp>";
            strXml += signo + "emailUsuarioApp/>";
            strXml += signo + "desCoSer/>";
            strXml += signo + "codigoInteraccion/>";
            strXml += signo + "nroCuenta>" + Session.SessionParams.DATACUSTOMER.Account + "</nroCuenta>";
            strXml += signo + "tipTra>" + tiptra + "</tipTra>";
            strXml += signo + "flgReingenieria>" + that.TransactionSession.Data.Configuration.Programacion_flgReingenieria + "</flgReingenieria>";
            strXml += signo + "codMotot>" + that.TransactionSession.Data.Configuration.Programacion_CodMotot + "</codMotot>";
            strXml += signo + "ticklerCode>" + that.TransactionSession.Data.Configuration.Programacion_TicklerCode + "</ticklerCode>";
            strXml += monto;
            strXml += signo + "idTareaProg>" + idProgramTask + "</idTareaProg>";
            strXml += signo + "usureg>" + Session.SessionParams.USERACCESS.login + "</usureg>";
            strXml += signo + "nodopostventa>" + 'Nodo ' + $("#spnNode").text() + "</nodopostventa>";
            strXml += signo + "platf_facturador>" + that.TransactionSession.Data.Configuration.Plataforma_Facturador + "</platf_facturador>";

            strXml += strXmlNodeP.replace(signo, signo + '/');
            /*reasonCode*/
            /************/

            return strXml;
        },

        getXMLTramaConstancia: function () {
            var that = this,
                controls = that.getControls();

            var feed = "";
            feed += "<FORMATO_TRANSACCION>{0}</FORMATO_TRANSACCION>";
            feed += "<TRANSACCION_DESCRIPCION>{1}</TRANSACCION_DESCRIPCION>";
            feed += "<CENTRO_ATENCION_AREA>{2}</CENTRO_ATENCION_AREA>";
            feed += "<TITULAR_CLIENTE>{3}</TITULAR_CLIENTE>";
            feed += "<REPRES_LEGAL>{4}</REPRES_LEGAL>";
            feed += "<TIPO_DOC_IDENTIDAD>{5}</TIPO_DOC_IDENTIDAD>";
            feed += "<NRO_DOC_IDENTIDAD>{6}</NRO_DOC_IDENTIDAD>";
            feed += "<FECHA_TRANSACCION_PROGRAM>{7}</FECHA_TRANSACCION_PROGRAM>";
            feed += "<ACCION_RETENCION>{8}</ACCION_RETENCION>";
            feed += "<NRO_SERVICIO>{9}</NRO_SERVICIO>";
            feed += "<FECHA_SUSP>{10}</FECHA_SUSP>";
            feed += "<FECHA_ACTIVACION>{11}</FECHA_ACTIVACION>";
            feed += "<COSTO_REACTIVACION>{12}</COSTO_REACTIVACION>";
            feed += "<CASO_INTER>{13}</CASO_INTER>";
            feed += "<FECHA_AUTORIZACION>{14}</FECHA_AUTORIZACION>";
            feed += "<CUENTA_POSTPAGO>{15}</CUENTA_POSTPAGO>";
            feed += "<CONTRATO>{16}</CONTRATO>";



            feed = string.format(feed,
                that.TransactionSession.Data.Configuration.Constancia_FormatoTransaccion,
                that.TransactionSession.Data.Configuration.Constancia_TransaccionDescripcion,
                $("#ddlCenterofAttention option:selected").html(),
                that.TransactionSession.Data.CustomerInformation.CustomerName,
                that.TransactionSession.Data.CustomerInformation.LegalRepresentative,
                that.TransactionSession.Data.CustomerInformation.LegalRepresentativeDocument,
                that.TransactionSession.Data.CustomerInformation.DocumentNumber,
                that.getFechaActual(),
                "",
                that.TransactionSession.Data.Configuration.Tipificacion_KeyCustomerInteract + that.TransactionSession.Data.CustomerInformation.CustomerID,
                controls.calendarFecSus.val(),
                controls.calendarFecReac.val(),
                controls.txtImporPagar.val() + " " + "CON IGV",
                "@idInteraccion",
                that.getFechaActual(),
                Session.SessionParams.DATACUSTOMER.Account,
                that.TransactionSession.Data.CustomerInformation.ContractNumber
                )

            return "<PLANTILLA>" + feed + "</PLANTILLA>";
        },

        loadInformApportionment: function () {
            //debugger;
            var that = this,
                controls = this.getControls();
            console.log('****************************************************');

            /*Valores de interfaz y cliente*/
            var cargoFijoActual = that.priceFormat($('#spnPackageCost').html());
            console.log(' cargoFijoActual-->' + cargoFijoActual);
            var cicloFacturacion = that.TransactionSession.Data.CustomerInformation.BillingCycle;
            console.log(' cicloFacturacion-->' + cicloFacturacion);
            var fecSuspension = new Date($("#calendarFecSus").val().split('/')[2] + "/" + $("#calendarFecSus").val().split('/')[1] + "/" + $("#calendarFecSus").val().split('/')[0]);
            var fecReconexion = new Date($("#calendarFecReac").val().split('/')[2] + "/" + $("#calendarFecReac").val().split('/')[1] + "/" + $("#calendarFecReac").val().split('/')[0]);
            var fecCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);
            var fecActual = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + that.getFechaActual().split('/')[0]);
            console.log(' fecSuspension-->' + fecSuspension);
            console.log(' fecReconexion-->' + fecReconexion);
            console.log(' fecCicloFacturacion-->' + fecCicloFacturacion);

            /*Ciclos de Facturación por mes*/
            var antCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);
            var sigCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);
            var segCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);
            var terCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);
            var cuarCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);

            if (fecActual < fecCicloFacturacion) {
                sigCicloFacturacion = new Date(sigCicloFacturacion.setMonth(sigCicloFacturacion.getMonth()));
                antCicloFacturacion = new Date(antCicloFacturacion.setMonth(antCicloFacturacion.getMonth() - 1));
            }
            else {
                sigCicloFacturacion = new Date(sigCicloFacturacion.setMonth(sigCicloFacturacion.getMonth() + 1));
            }
            console.log(' sigCicloFacturacion-->' + sigCicloFacturacion);
            segCicloFacturacion = new Date(segCicloFacturacion.setMonth(sigCicloFacturacion.getMonth() + 1));
            console.log(' segCicloFacturacion-->' + segCicloFacturacion);
            terCicloFacturacion = new Date(terCicloFacturacion.setMonth(sigCicloFacturacion.getMonth() + 2));
            console.log(' terCicloFacturacion-->' + terCicloFacturacion);
            cuarCicloFacturacion = new Date(cuarCicloFacturacion.setMonth(sigCicloFacturacion.getMonth() + 3));
            console.log(' cuarCicloFacturacion-->' + cuarCicloFacturacion);

            /*Cantidad de días por mes de facturación*/
            var dias = $.monthDays();
            var oneDay = 24 * 60 * 60 * 1000;
            var cantDiasProxCiclo = !$.string.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation.cantDiasProxCiclo) ? Math.abs(that.TransactionSession.Data.CustomerInformation.cantDiasProxCiclo) : dias; //---EAI
            console.log('WS - cantDiasProxCiclo-->' + cantDiasProxCiclo);
            var cantDiasSigRecibo = dias; //cantDiasProxCiclo - Omito el valor de BSCS porque no trae el valor exacto y distorciona los cálculos
            console.log('1- cantDiasSigRecibo-->' + cantDiasSigRecibo);
            var cantDiasSegRecibo = that.daysInAMonth(segCicloFacturacion);
            console.log('2- cantDiasSegRecibo-->' + cantDiasSegRecibo);
            var cantDiasTerRecibo = that.daysInAMonth(terCicloFacturacion);
            console.log('3- cantDiasTerRecibo-->' + cantDiasTerRecibo);
            var cantDiasCuarRecibo = that.daysInAMonth(cuarCicloFacturacion);
            console.log('4- cantDiasCuarRecibo-->' + cantDiasCuarRecibo);

            /*Valores de BSCS*/
            var totalDiasSuspensionBSCS = !$.string.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation.cantDiasSuspendidosCiclo) ? that.TransactionSession.Data.CustomerInformation.cantDiasSuspendidosCiclo : 0;//---EAI
            console.log('WS - totalDiasSuspension-->' + totalDiasSuspensionBSCS);
            var costoReconexionBSCS = !$.string.isEmptyOrNull(that.TransactionSession.Data.CustomerInformation.cargoReconexion) ? that.TransactionSession.Data.CustomerInformation.cargoReconexion : 0;//---EAI
            console.log('WS - costoReconexion-->' + costoReconexionBSCS);

            /*Escenarios para cálculo de días de prorrateo*/
            /*Cálculos de los montos por mes*/
            var cantDiasAntesCierre = 0;
            var cantDiasDespuesCierre = 0;
            var montoProrrAntesCierre = 0.00;
            var montoProrrDespuesCierre = 0.00;
            var devolPlanActualporSuspension = 0.00;
            var devolPlanActualporSuspSigRecibo = 0.00;
            var devolPlanActualporSuspSegRecibo = 0.00;

            //Inicio suspensión en el recibo en curso (días antes del ciclo de facturación)
            if (fecSuspension > fecActual && fecSuspension < sigCicloFacturacion) {
                console.log('1.Escenario: Inicio suspensión en el recibo en curso.');
                cantDiasAntesCierre = Math.round(Math.abs((fecSuspension.getTime() - antCicloFacturacion.getTime()) / (oneDay)));
                montoProrrAntesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSigRecibo) * parseFloat(cantDiasAntesCierre);
                montoProrrAntesCierre = parseFloat(montoProrrAntesCierre) - parseFloat(cargoFijoActual);
                devolPlanActualporSuspension = montoProrrAntesCierre;
                //Rexonexión en del mismo mes
                if (fecReconexion >= fecActual && fecReconexion < sigCicloFacturacion) {
                    console.log('1.1.Escenario: Reactivación en mismo recibo en curso.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - sigCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSigRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspension = montoProrrAntesCierre + montoProrrDespuesCierre;
                    devolPlanActualporSuspSigRecibo = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = parseFloat(cargoFijoActual);
                    //Reconexión en el segundo mes
                } else if (fecReconexion >= sigCicloFacturacion && fecReconexion < segCicloFacturacion) {
                    console.log('1.2.Escenario: Reactivación en el siguiente recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - segCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSegRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSigRecibo = montoProrrDespuesCierre;
                    devolPlanActualporSuspSegRecibo = parseFloat(cargoFijoActual);
                    //Reconexión en el tercer mes
                } else if (fecReconexion >= segCicloFacturacion && fecReconexion < terCicloFacturacion) {
                    console.log('1.3.Escenario: Reactivación en el segundo recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - terCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasTerRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = montoProrrDespuesCierre;
                }
                //Debería de considerarse un cuarto mes para los casos donde abarque 4 meses la suspensión.
                //Inicio suspensión en siguiente recibo
            } else if (fecSuspension >= sigCicloFacturacion && fecSuspension < segCicloFacturacion) {
                console.log('2.Escenario: Inicio suspensión en siguiente recibo.');
                cantDiasAntesCierre = Math.round(Math.abs((fecSuspension.getTime() - sigCicloFacturacion.getTime()) / (oneDay)));
                montoProrrAntesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSigRecibo) * parseFloat(cantDiasAntesCierre);
                montoProrrAntesCierre = parseFloat(montoProrrAntesCierre) - parseFloat(cargoFijoActual);
                devolPlanActualporSuspension = montoProrrAntesCierre;
                //Rexonexión en del mismo mes
                if (fecReconexion >= sigCicloFacturacion && fecReconexion < segCicloFacturacion) {
                    console.log('2.1.Escenario: Reactivación en siguiente recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - segCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSigRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspension = montoProrrAntesCierre + montoProrrDespuesCierre;
                    devolPlanActualporSuspSigRecibo = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = parseFloat(cargoFijoActual);
                    //Reconexión en el segundo mes
                } else if (fecReconexion >= segCicloFacturacion && fecReconexion < terCicloFacturacion) {
                    console.log('2.2.Escenario: Reactivación en el segundo recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - terCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSegRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSigRecibo = montoProrrDespuesCierre;
                    devolPlanActualporSuspSegRecibo = parseFloat(cargoFijoActual);
                    //Reconexión en el tercer mes
                } else if (fecReconexion >= terCicloFacturacion && fecReconexion < cuarCicloFacturacion) {
                    console.log('2.3.Escenario: Reactivación en el tercer recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - cuarCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasTerRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = montoProrrDespuesCierre;
                }
                //Inicio suspensión en segundo mes
            } else if (fecSuspension >= segCicloFacturacion && fecSuspension < terCicloFacturacion) {
                console.log('3.Escenario: Inicio suspensión en el segundo recibo.');
                cantDiasAntesCierre = Math.round(Math.abs((fecSuspension.getTime() - segCicloFacturacion.getTime()) / (oneDay)));
                montoProrrAntesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSegRecibo) * parseFloat(cantDiasAntesCierre);
                montoProrrAntesCierre = parseFloat(montoProrrAntesCierre) - parseFloat(cargoFijoActual);
                devolPlanActualporSuspSigRecibo = montoProrrAntesCierre;
                //Rexonexión en el mismo segundo mes
                if (fecReconexion >= segCicloFacturacion && fecReconexion < terCicloFacturacion) {
                    console.log('3.1.Escenario: Reactivación en el segundo recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - terCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasSegRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspension = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSigRecibo = montoProrrAntesCierre + montoProrrDespuesCierre;
                    devolPlanActualporSuspSegRecibo = parseFloat(cargoFijoActual);
                    //Reconexión en el tercer mes
                } else if (fecReconexion >= terCicloFacturacion && fecReconexion < cuarCicloFacturacion) {
                    console.log('3.2.Escenario: Reactivación en el tercer recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - cuarCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasTerRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspension = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = montoProrrDespuesCierre;
                }
                //Inicio suspensión en tercer mes
            } else if (fecSuspension >= terCicloFacturacion && fecSuspension < cuarCicloFacturacion) {
                console.log('4.Escenario: Inicio suspensión en el tercer recibo.');
                cantDiasAntesCierre = Math.round(Math.abs((fecSuspension.getTime() - terCicloFacturacion.getTime()) / (oneDay)));
                montoProrrAntesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasTerRecibo) * parseFloat(cantDiasAntesCierre);
                montoProrrAntesCierre = parseFloat(montoProrrAntesCierre) - parseFloat(cargoFijoActual);
                devolPlanActualporSuspSegRecibo = montoProrrAntesCierre;
                //Reconexión en el mismo tercer mes
                if (fecReconexion >= terCicloFacturacion && fecReconexion < cuarCicloFacturacion) {
                    console.log('4.1.Escenario: Reactivación en el tercer recibo.');
                    cantDiasDespuesCierre = Math.round(Math.abs((fecReconexion.getTime() - cuarCicloFacturacion.getTime()) / (oneDay)));
                    montoProrrDespuesCierre = parseFloat(cargoFijoActual) / parseFloat(cantDiasTerRecibo) * parseFloat(cantDiasDespuesCierre);
                    montoProrrDespuesCierre = parseFloat(montoProrrDespuesCierre) + parseFloat(cargoFijoActual);
                    devolPlanActualporSuspension = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSigRecibo = parseFloat(cargoFijoActual);
                    devolPlanActualporSuspSegRecibo = montoProrrAntesCierre + montoProrrDespuesCierre;
                }
            }

            console.log(' cantDiasAntesCierre-->' + cantDiasAntesCierre);
            console.log(' cantDiasDespuesCierre-->' + cantDiasDespuesCierre);
            console.log(' montoProrrAntesCierre-->' + montoProrrAntesCierre);
            console.log(' montoProrrDespuesCierre-->' + montoProrrDespuesCierre);
            console.log('1er-- devolPlanActualporSuspension:-->' + parseFloat(devolPlanActualporSuspension));
            console.log('2do-- devolPlanActualporSuspSigRecibo:-->' + parseFloat(devolPlanActualporSuspSigRecibo));
            console.log('3ero-- devolPlanActualporSuspSegRecibo:-->' + parseFloat(devolPlanActualporSuspSegRecibo));

            ////2. Devolucion por Suspension
            //var devolSuspension = parseFloat(cargoFijoActual) * parseFloat(totalDiasSuspensionBSCS) / parseFloat(cantDiasMes) * -1;//DSUSP
            //console.log('2. DSUSP-->' + devolSuspension);
            // 4. Costo de Reconexión SIAC
            var costoReconexion = controls.txtImporPagar.val();//CREC
            console.log(' CRESIAC-->' + costoReconexion);

            /*1er*************************************************************/
            var prorrateoSigRecibo = 0.00
            prorrateoSigRecibo += parseFloat(devolPlanActualporSuspension);
            //prorrateoSigRecibo += parseFloat(devolSuspension);
            //prorrateoSigRecibo += parseFloat(costoReconexionBSCS);

            console.log('1er-- cargoFijoActual:-->' + parseFloat(cargoFijoActual));
            console.log('1er-- devolPlanActualporSuspension:-->' + parseFloat(devolPlanActualporSuspension));
            //console.log('1er-- devolSuspension:-->' + parseFloat(devolSuspension));
            //console.log('1er-- costoReconexionBSCS:-->' + parseFloat(costoReconexionBSCS));

            /*2do*************************************************************/
            var prorrateoSegRecibo = 0.00;
            prorrateoSegRecibo += parseFloat(devolPlanActualporSuspSigRecibo);

            console.log('2do-- cargoFijoActual:-->' + parseFloat(cargoFijoActual));
            console.log('2do-- devolPlanActualporSuspSigRecibo:-->' + parseFloat(devolPlanActualporSuspSigRecibo));
            //console.log('2do-- devolSuspension:-->' + parseFloat(devolSuspension));

            /*3er*************************************************************/
            var prorrateoTerRecibo = 0.00;
            prorrateoTerRecibo += parseFloat(devolPlanActualporSuspSegRecibo);

            console.log('3ero-- cargoFijoActual:-->' + parseFloat(cargoFijoActual));
            console.log('3ero-- devolPlanActualporSuspSegRecibo:-->' + parseFloat(devolPlanActualporSuspSegRecibo));

            $('#spnSiguienteRecibo').html('S/. ' + that.priceFormat(prorrateoSigRecibo));
            $('#spnCargoSegundoMes').html('S/. ' + that.priceFormat(prorrateoSegRecibo));
            $('#spnCargoTercerMes').html('S/. ' + that.priceFormat(prorrateoTerRecibo));

        },

        daysInAMonth: function (anydate) {
            var d = new Date(new Date(anydate).getFullYear(),
                    new Date(anydate).getMonth() + 1, 0);
            return d.getDate();
        },

        priceFormat: function (value) {
            return parseFloat(value).toFixed(2);
        },

        getServiciosTransversal: function (idProgramTaskSusp, idProgramTaskReco) {
            var that = this,
                controls = that.getControls();

            var xjsonTrama = {
                "listaTrama": []
            };

            var flag = true;
            if (that.IsEditProgramTask() && $.string.isEmptyOrNull(idProgramTaskSusp))
                flag = false;

            if (flag) {
                //if (!$.string.isEmptyOrNull(idProgramTaskSusp)) {
                if (!$.string.isEmptyOrNull(idProgramTaskSusp) || !that.IsEditProgramTask()) {//Ojo !!!!!!!
                    var S = {
                        "cod": that.TransactionSession.Data.Configuration.Programacion_CodigoSuspension,
                        "msisdn": "",
                        "fecprog": controls.calendarFecSus.val(),
                        "codid_pri": that.TransactionSession.Data.CustomerInformation.ContractNumber,
                        "customerid_pri": that.TransactionSession.Data.CustomerInformation.CustomerID,
                        "id_eai_sw": that.TransactionSession.Data.AuditRequest.Transaction,
                        "tipo_servicio": that.TransactionSession.Data.Configuration.Constante_Producto,
                        "coser": that.TransactionSession.Data.Configuration.Programacion_Coser,
                        "tipo_reg": "",
                        "usuario_sis": that.TransactionSession.Data.Configuration.Constantes_UsrAplicacion,
                        "usuario_app": Session.SessionParams.USERACCESS.login,
                        "email_usuario_app": "",
                        "estado": that.TransactionSession.Data.Configuration.Programacion_CodigoEstado,
                        "esbatch": that.TransactionSession.Data.Configuration.Programacion_EsBatch,
                        "xmlentrada": that.getXMLTareaProgramada("sus", idProgramTaskSusp),
                        "desc_co_ser": "",
                        "codigo_interaccion": "@idInteraccion",
                        "nrocuenta": Session.SessionParams.DATACUSTOMER.Account,
                        "cod_error": that.TransactionSession.Data.Configuration.Programacion_codError,
                        "msj_error": that.TransactionSession.Data.Configuration.Programacion_msjError
                    };
                }
                xjsonTrama.listaTrama.push(S);
            }

            var R = {
                "cod": that.TransactionSession.Data.Configuration.Programacion_CodigoReconexion,
                "msisdn": "",
                "fecprog": controls.calendarFecReac.val(),
                "codid_pri": that.TransactionSession.Data.CustomerInformation.ContractNumber,
                "customerid_pri": that.TransactionSession.Data.CustomerInformation.CustomerID,
                "id_eai_sw": that.TransactionSession.Data.AuditRequest.Transaction,
                "tipo_servicio": that.TransactionSession.Data.Configuration.Constante_Producto,
                "coser": that.TransactionSession.Data.Configuration.Programacion_Coser,
                "tipo_reg": "",
                "usuario_sis": that.TransactionSession.Data.Configuration.Constantes_UsrAplicacion,
                "usuario_app": Session.SessionParams.USERACCESS.login,
                "email_usuario_app": "",
                "estado": that.TransactionSession.Data.Configuration.Programacion_CodigoEstado,
                "esbatch": that.TransactionSession.Data.Configuration.Programacion_EsBatch,
                "xmlentrada": that.getXMLTareaProgramada("rec", idProgramTaskReco),
                "desc_co_ser": "",
                "codigo_interaccion": "@idInteraccion",
                "nrocuenta": Session.SessionParams.DATACUSTOMER.Account,
                "cod_error": that.TransactionSession.Data.Configuration.Programacion_codError,
                "msj_error": that.TransactionSession.Data.Configuration.Programacion_msjError
            };

            xjsonTrama.listaTrama.push(R);

            return xjsonTrama.listaTrama;

        },


        saveTransaction: function (idProgramTaskSusp, idProgramTaskReco) {
            var that = this,
                controls = that.getControls(),
                objParameters = {},
                Services = [
                    {
                        "servicio": "Cliente",
                        "parametros": [
                            {
                                "parametro": "phone",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_KeyCustomerInteract + that.TransactionSession.Data.CustomerInformation.CustomerID
                            },
                            {
                                "parametro": "usuario",
                                "valor": Session.SessionParams.USERACCESS.login
                            },
                            {
                                "parametro": "nombres",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerName
                            },
                            {
                                "parametro": "apellidos",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerName
                            },
                            {
                                "parametro": "razonsocial",
                                "valor": that.TransactionSession.Data.CustomerInformation.LegalRepresentative
                            },
                            {
                                "parametro": "tipoDoc",
                                "valor": that.TransactionSession.Data.CustomerInformation.LegalRepresentativeDocument
                            },
                            {
                                "parametro": "numDoc",
                                "valor": that.TransactionSession.Data.CustomerInformation.DocumentNumber
                            },
                            {
                                "parametro": "domicilio",
                                "valor": Session.SessionParams.DATACUSTOMER.Address
                            },
                            {
                                "parametro": "distrito",
                                "valor": that.TransactionSession.Data.CustomerInformation.BillingDistrict
                            },
                            {
                                "parametro": "departamento",
                                "valor": that.TransactionSession.Data.CustomerInformation.BillingDepartment
                            },
                            {
                                "parametro": "provincia",
                                "valor": that.TransactionSession.Data.CustomerInformation.BillingProvince
                            },
                            {
                                "parametro": "modalidad",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_Modalidad
                            }
                        ]
                    },
                    {
                        "servicio": "Tipificacion",
                        "parametros": [
                            {
                                "parametro": "coid",
                                "valor": that.TransactionSession.Data.CustomerInformation.ContractNumber
                            },
                            {
                                "parametro": "customer_id",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerID
                            },
                            {
                                "parametro": "Phone",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_KeyCustomerInteract + that.TransactionSession.Data.CustomerInformation.CustomerID
                            },
                            {
                                "parametro": "flagReg",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_FlagReg
                            },
                            {
                                "parametro": "contingenciaClarify",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_ContingenciaClarify
                            },
                            {
                                "parametro": "tipo",
                                "valor": that.TransactionSession.Data.Tipificacion[0].Tipo
                            },
                            {
                                "parametro": "clase",
                                "valor": that.TransactionSession.Data.Tipificacion[0].Clase
                            },
                            {
                                "parametro": "SubClase",
                                "valor": that.TransactionSession.Data.Tipificacion[0].SubClase
                            },
                            {
                                "parametro": "metodoContacto",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_MetodoContacto
                            },
                            {
                                "parametro": "tipoTipificacion",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_TipoTipificacion
                            },
                            {
                                "parametro": "agente",
                                "valor": Session.SessionParams.USERACCESS.login
                            },
                            {
                                "parametro": "usrProceso",
                                "valor": that.TransactionSession.Data.Configuration.Constantes_UsrAplicacion
                            },
                            {
                                "parametro": "hechoEnUno",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_HechoDeUno
                            },
                            {
                                "parametro": "Notas",
                                "valor": controls.txtNotas.val() == null ? '' : controls.txtNotas.val().replace(/\n/g, "\\n")
                            },
                            {
                                "parametro": "flagCaso",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_FlagCaso
                            },
                            {
                                "parametro": "resultado",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_Resultado
                            },
                            {
                                "parametro": "inconvenCode",
                                "valor": ""
                            },
                            {
                                "parametro": "tipoInter",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_TipoInter
                            }

                        ]
                    },
                    {
                        "servicio": "Plantilla",
                        "parametros": [
                            {
                                "parametro": "nroIteraccion",
                                "valor": ""
                            },
                            {
                                "parametro": "xinter1",
                                "valor": controls.calendarFecSus.val()
                            },
                            {
                                "parametro": "inter2",
                                "valor": controls.calendarFecReac.val()
                            },
                            {
                                "parametro": "xinter3",
                                "valor": that.TransactionSession.flgRetencion
                            },
                            {
                                "parametro": "inter4",
                                "valor": ""
                            },
                            {
                                "parametro": "inter5",
                                "valor": controls.txtImporPagar.val()
                            },
                            {
                                "parametro": "inter6",
                                "valor": ''
                            },
                            {
                                "parametro": "inter7",
                                "valor": controls.txtImporPagar.val()
                            },
                            {
                                "parametro": "inter15",
                                "valor": $("#ddlCenterofAttention option:selected").html()
                            },
                            {
                                "parametro": "inter16",
                                "valor": that.TransactionSession.Data.CustomerInformation.ContractNumber
                            },
                            {
                                "parametro": "inter17",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerName
                            },
                            {
                                "parametro": "inter18",
                                "valor": ""
                            },
                            {
                                "parametro": "inter19",
                                "valor": ""
                            },
                            {
                                "parametro": "inter21",
                                "valor": ""
                            },
                            {
                                "parametro": "inter30",
                                "valor": controls.txtNotas.val() == null ? '' : controls.txtNotas.val().replace(/\n/g, "\\n")
                            },
                            {
                                "parametro": "P_BIRTHDAY",
                                "valor": "" //that.getFechaActual()
                            },
                            {
                                "parametro": "P_NAME_LEGAL_REP",
                                "valor": that.TransactionSession.Data.CustomerInformation.LegalRepresentative
                            },
                            {
                                "parametro": "P_PLUS_INTER2INTERACT",
                                "valor": ""
                            },
                            {
                                "parametro": "P_ADDRESS",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerName
                            },
                            {
                                "parametro": "P_CLARO_LDN1",
                                "valor": that.TransactionSession.Data.CustomerInformation.LegalRepresentativeDocument
                            },
                            {
                                "parametro": "P_CLARO_LDN2",
                                "valor": that.TransactionSession.Data.CustomerInformation.DocumentNumber
                            },
                            {
                                "parametro": "P_CLAROLOCAL3",
                                "valor": ""
                            },
                            {
                                "parametro": "P_CLAROLOCAL4",
                                "valor": ""
                            },
                            {
                                "parametro": "P_CLAROLOCAL5",
                                "valor": ""
                            },
                            {
                                "parametro": "P_EMAIL",
                                "valor": ""
                            },
                            {
                                "parametro": "P_FIRST_NAME",
                                "valor": ""
                            },
                            {
                                "parametro": "P_FIXED_NUMBER",
                                "valor": ""
                            },
                            {
                                "parametro": "P_LASTNAME_REP",
                                "valor": ""
                            },
                            {
                                "parametro": "P_REASON",
                                "valor": ""
                            },
                            {
                                "parametro": "P_MODEL",
                                "valor": ""
                            },
                            {
                                "parametro": "P_LOT_CODE",
                                "valor": ""
                            },
                            {
                                "parametro": "P_FLAG_REGISTERED",
                                "valor": ""
                            },
                            {
                                "parametro": "P_REGISTRATION_REASON",
                                "valor": ""
                            },
                            {
                                "parametro": "P_CLARO_NUMBER",
                                "valor": that.TransactionSession.Data.Configuration.Tipificacion_KeyCustomerInteract + that.TransactionSession.Data.CustomerInformation.CustomerID
                            },
                            {
                                "parametro": "P_MONTH",
                                "valor": that.getFechaActual()
                            },
                            {
                                "parametro": "P_BASKET",
                                "valor": that.TransactionSession.Data.CustomerInformation.ContractNumber
                            },

                            {
                                "parametro": "P_CITY",
                                "valor": ""
                            },
                            {
                                "parametro": "P_DEPARTMENT",
                                "valor": ""
                            },
                            {
                                "parametro": "P_DISTRICT",
                                "valor": ""
                            },
                            {
                                "parametro": "P_FLAG_CHARGE",
                                "valor": ""
                            },
                            {
                                "parametro": "P_REFERENCE_ADDRESS",
                                "valor": ""
                            },
                            {
                                "parametro": "P_TYPE_DOCUMENT",
                                "valor": ""
                            },
                            {
                                "parametro": "P_ICCID",
                                "valor": ""
                            }
                        ]
                    },

                    {
                        "servicio": "TareasPogramadas",
                        "parametros": [

                            {
                                "parametro": "listaRegistro",
                                "valor": JSON.stringify(that.getServiciosTransversal(idProgramTaskSusp, idProgramTaskReco))
                            },


                        ]
                    },
                    {
                        "servicio": "Constancia",
                        "parametros": [
                            {
                                "parametro": "DRIVE_CONSTANCIA",
                                "valor": that.getXMLTramaConstancia()
                            }
                        ]
                    },
		            {
		                "servicio": "Correo",
		                "parametros": [
				            {
				                "parametro": "remitente",
				                "valor": that.TransactionSession.Data.Configuration.Correo_Remitente
				            },
				            {
				                "parametro": "destinatario",
				                "valor": controls.txtSendMail.val()
				            },
				            {
				                "parametro": "asunto",
				                "valor": that.TransactionSession.Data.Configuration.Correo_Asunto
				            },
				            {
				                "parametro": "htmlFlag",
				                "valor": that.TransactionSession.Data.Configuration.Correo_HtmlFlag
				            },
				            {
				                "parametro": "driver/fileName",
				                "valor": that.TransactionSession.Data.Configuration.Correo_Driver
				            },
				            {
				                "parametro": "formatoConstancia",
				                "valor": that.TransactionSession.Data.Configuration.Correo_FormatoConstancia
				            },
                            {
                                "parametro": "p_fecha",
                                "valor": "dd_MM_yyyy"
                            },
				            {
				                "parametro": "directory",
				                "valor": that.TransactionSession.Data.Configuration.Correo_Directory
				            },
				            {
				                "parametro": "fileName",
				                "valor": "@idInteraccion_@p_fecha_" + that.TransactionSession.Data.Configuration.Correo_FileName + "@extension"
				            },
				            {
				                "parametro": "mensaje",
				                "valor": that.TransactionSession.Data.Configuration.Correo_Mensaje
				            }
		                ]
		            },
                    {
                        "servicio": "Auditoria",
                        "parametros": [
                            {
                                "parametro": "ipcliente",
                                "valor": that.TransactionSession.Data.AuditRequest.idApplication
                            },
                            {
                                "parametro": "nombrecliente",
                                "valor": that.TransactionSession.Data.CustomerInformation.CustomerName
                            },
                            {
                                "parametro": "ipservidor",
                                "valor": that.TransactionSession.Data.AuditRequest.IPAddress
                            },
                            {
                                "parametro": "nombreservidor",
                                "valor": that.TransactionSession.Data.AuditRequest.ApplicationName
                            },
                            {
                                "parametro": "cuentausuario",
                                "valor": Session.SessionParams.USERACCESS.login
                            },
                            {
                                "parametro": "monto",
                                "valor": that.TransactionSession.Data.Configuration.Constantes_Monto
                            },
                            {
                                "parametro": "texto",
                                "valor": string.format(" N° Contrato: {0}, Fecha y Hora: {1} {2}", that.TransactionSession.Data.CustomerInformation.ContractNumber, that.getFechaActual(), that.getHoraActual())
                            },
                            {
                                "parametro": "TRANSACCION_DESCRIPCION",
                                "valor": that.TransactionSession.Data.Tipificacion[0].SubClase
                            },
                            {
                                "parametro": "idTransaccion",
                                "valor": that.TransactionSession.Data.AuditRequest.Transaction
                            }
                        ]
                    },
				    {
				        "servicio": "Trazabilidad",
				        "parametros": [
						    {
						        "parametro": "tipoTransaccion",
						        "valor": that.TransactionSession.Data.Configuration.Constancia_FormatoTransaccion
						    },
						    {
						        "parametro": "tarea",
						        "valor": "generaConstancia"
						    },
						    {
						        "parametro": "fechaRegistro",
						        "valor": that.getFechaActual()
						    },
						    {
						        "parametro": "descripcion",
						        "valor": "Trazabilidad generada desde SIACUNICO"
						    }
				        ]
				    }
                ];

            objParameters = {
                idFlujo: '',
                servicios: Services
            }
            objParameters.TransactionID = that.TransactionSession.Data.idTransactionFront;
            $.ajax({
                url: '/SuspensionReconnection/Home/postGeneraTransaccion',
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify(objParameters),
                global: false,
                success: function (res) {

                    if (res.oDataResponse.MessageResponse.Body.lstParam != null) {
                        if (res.oDataResponse.MessageResponse.Body.codigoRespuesta == "0") {
                            alert(that.TransactionSession.Data.Configuration.Constantes_MensajeFinal);
                            controls.btnConstancy.show();
                            controls.btnSave.hide();
                            that.TransactionSession.Data.Constancia = !$.string.isEmptyOrNull(response.data.MessageResponse.Body.constancia) ? true : false;

                        } else {
                            alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                        }
                    } else {
                        alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                    }
                    $.unblockUI();
                },
                error: function (gerr) {
                    console.log(gerr);
                    alert('Hubo un error. Informe o vuelva a intentar');
                    $.unblockUI();
                }
            });
        }
    }

    $.fn.form = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = ['resizeContent', 'getControls'];

        this.each(function () {
            var $this = $(this),
                data = $this.data('form'),
                options = $.extend({}, $.fn.form.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('form', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw "Unknown method: " + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return value || this;
    };

    $.fn.form.defaults = {
    }

    $('#main-contenedor').form();

})(jQuery);

function openRules() {
    document.getElementById("myRulenav").style.width = "25%";
}

function closeRules() {
    document.getElementById("myRulenav").style.width = "0";
}
