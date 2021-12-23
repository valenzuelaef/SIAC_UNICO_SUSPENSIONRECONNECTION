(function ($, undefined) {

    'use strict';

    var Form = function ($element, options) {
        $.extend(this, $.fn.choseSuspensionReconnection.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            calendarFecSus: $('#calendarFecSus', $element),
            calendarFecReac: $('#calendarFecReac', $element),
            chkRetencion: $('#chkRetencion', $element),
            txtImporPagar: $('#txtImporPagar', $element),
            chkSendEmail: $('#chkSendEmail', $element),
            txtEmail: $('#txtEmail', $element)
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {
            var that = this;
            var controls = this.getControls();
            controls.calendarFecSus.datepicker({ format: 'dd/mm/yyyy', todayHighlight: true, startDate:'+0d' ,endDate: '+62d' });
            controls.calendarFecReac.datepicker({ format: 'dd/mm/yyyy', todayHighlight: true, startDate:'+0d', endDate: '+62d' });
            controls.chkRetencion.addEvent(that, 'change', that.chkRetencion_change);
            that.render();
        },

        chkRetencion_change: function(){
            var that = this;
            var controls = this.getControls();
            if (controls.chkRetencion.is(":checked")) {
                controls.txtImporPagar.val("0");
            } else {
                controls.txtImporPagar.val("29.75");
            }
        },

        render: function () {
            var that = this;
            var controls = this.getControls();
            
            that.loadCustomerInformation();
        },

        getControls: function () {
            return this.m_controls || {};
        },

        loadCustomerInformation: function(){
            var that = this;
            var controls = that.getControls();
            controls.txtEmail.val(Session.SessionParams.DATACUSTOMER.Email);
        },

        setControls: function (value) {
            this.m_controls = value;
        }
    }

    $.fn.choseSuspensionReconnection = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = ['resizeContent', 'getControls'];

        this.each(function () {
            var $this = $(this),
                data = $this.data('choseSuspensionReconnection'),
                options = $.extend({}, $.fn.choseSuspensionReconnection.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('choseSuspensionReconnection', data);
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

    $.fn.choseSuspensionReconnection.defaults = {
    }

    $('#main-contenedor').choseSuspensionReconnection();

})(jQuery);