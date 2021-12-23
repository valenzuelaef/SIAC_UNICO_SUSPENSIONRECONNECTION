$(function () {
    $('.Save-step').hide();
    $('.Constancy-step').hide();
    $('.prev-step').hide();
    $('.next-step').show();

    $('.btn-circle-step').on('click', function () {
        var length = $('.btn-circle-step').length;
        var index = $(this).attr('index');
        var percent = $(this).attr('percent');
        document.getElementById('prog').style.width = percent;
        for (var i = 1; i <= length; i++) {
            if (i <= index) {
                $('[index="' + i + '"]').removeClass('btn-default-Step').addClass('transaction-button-Steps');
            } else {
                $('[index="' + i + '"]').removeClass('transaction-button-Steps').addClass('btn-default-Step');
            }
        }

        for (var i = 1; i <= length; i++) {
            if (i <= index) {
                var clase = $('[indexStep="' + i + '"]').attr('class');
                if (clase.indexOf('-active') < 0)
                    $('[indexStep="' + i + '"]').removeClass(clase).addClass(clase + '-active');

            } else {
                var clase = $('[indexStep="' + i + '"]').attr('class');
                var pos = clase.indexOf('-active')
                $('[indexStep="' + i + '"]').removeClass(clase.substring(0, pos)).addClass(clase);
            }
        }

        switch (percent) {
            case '0%':
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').hide();
                $('.next-step').show();
                break;
            case '100%':
                $('.Save-step').show();
                $('.Constancy-step').show();
                $('.prev-step').show();
                $('.next-step').hide();
                break;
            default:
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').show();
                $('.next-step').show();
        }

    });

    $('.next-step, .prev-step').on('click', function (e) {
        navigateTabs(e);
    });

    $('.close').on('click', function (e) {
        $(this).parent().hide();
    });

});

function navigateTabs(e) {

    var $activeTab = $('.step.tab-pane.active');

    if (e.target != null) {
        e = e.target;
    }

    if ($(e).hasClass('next-step') || $(e).hasClass('next-trans')) {
        var nextTab = $activeTab.next('.tab-pane').attr('id');
        var percent = $activeTab.next('.tab-pane').attr('percent');

        var length = $('.btn-circle-step').length;
        document.getElementById('prog').style.width = percent;

        if (nextTab != null) {
            $('.btn-circle-step.transaction-button-Steps').removeClass('transaction-button-Steps').addClass('btn-default-Step');
        }

        $('[href="#' + nextTab + '"]').tab('show');
        $('[href="#' + nextTab + '"]').removeClass('disabled');
        $('[href="#' + nextTab + '"]').prop('disabled', false);
        var index = $('[href="#' + nextTab + '"]').attr('index');
        for (var i = 1; i <= length; i++) {
            if (i <= index) {
                $('[index="' + i + '"]').removeClass('btn-default-Step').addClass('transaction-button-Steps');
            } else {
                $('[index="' + i + '"]').removeClass('transaction-button-Steps').addClass('btn-default-Step');
            }
        }

        for (var i = 1; i <= length; i++) {
            if (i <= index) {
                var clase = $('[indexStep="' + i + '"]').attr('class');
                if (clase.indexOf('-active') < 0)
                    $('[indexStep="' + i + '"]').removeClass(clase).addClass(clase + '-active');
            } else {
                var clase = $('[indexStep="' + i + '"]').attr('class');
                var pos = clase.indexOf('-active')
                $('[indexStep="' + i + '"]').removeClass(clase.substring(0, pos)).addClass(clase);
            }
        }

        switch (percent) {
            case '0%':
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').hide();
                $('.next-step').show();
                break;
            case '100%':
                $('.Save-step').show();
                $('.Constancy-step').show();
                $('.prev-step').show();
                $('.next-step').hide();
                break;
            default:
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').show();
                $('.next-step').show();
        }

    }

    if ($(e).hasClass('prev-step')) {
        var percent = $activeTab.prev('.tab-pane').attr('percent');
        document.getElementById('prog').style.width = percent;
        var length = $('.btn-circle-step').length;

        var prevTab = $activeTab.prev('.tab-pane').attr('id');
        if (prevTab != null) {
            $('.btn-circle-step.transaction-button-Steps').removeClass('transaction-button-Steps').addClass('btn-default-Step');
        }
        $('[href="#' + prevTab + '"]').addClass('transaction-button-Steps').removeClass('btn-default-Step');
        $('[href="#' + prevTab + '"]').tab('show');
        var index = $('[href="#' + prevTab + '"]').attr('index');
        for (var i = 1; i <= length; i++) {
            if (i <= index) {
                $('[index="' + i + '"]').removeClass('btn-default-Step').addClass('transaction-button-Steps');
            } else {
                $('[index="' + i + '"]').removeClass('transaction-button-Steps').addClass('btn-default-Step');
            }
        }

        switch (percent) {
            case '0%':
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').hide();
                $('.next-step').show();
                break;
            case '100%':
                $('.Save-step').show();
                $('.Constancy-step').show();
                $('.prev-step').show();
                $('.next-step').hide();
                break;
            default:
                $('.Save-step').hide();
                $('.Constancy-step').hide();
                $('.prev-step').show();
                $('.next-step').show();
        }
    }
}

function DataBinder(object_id) {
    // Use a jQuery object as simple PubSub
    var pubSub = jQuery({});

    // We expect a `data` element specifying the binding
    // in the form: data-bind-<object_id>="<property_name>"
    var data_attr = "bind-" + object_id,
        message = object_id + ":change";

    // Listen to change events on elements with the data-binding attribute and proxy
    // them to the PubSub, so that the change is "broadcasted" to all connected objects
    jQuery(document).on("change", "[data-" + data_attr + "]", function (evt) {
        var $input = jQuery(this);

        if ($input.prop('type') == 'checkbox') {
            pubSub.trigger(message, [$input.data(data_attr), $input.prop('checked')]);
        } else {
            pubSub.trigger(message, [$input.data(data_attr), $input.val()]);
        }

    });

    // PubSub propagates changes to all bound elements, setting value of
    // input tags or HTML content of other tags
    pubSub.on(message, function (evt, prop_name, new_val) {
        jQuery("[data-" + data_attr + "=" + prop_name + "]").each(function () {
            var $bound = jQuery(this);
            if ($bound.is("input, textarea, select")) {

                if ($bound.prop('type') == 'checkbox') {
                    $bound.prop('checked', new_val);
                } else {
                    $bound.val(new_val);
                }
            } else {
                $bound.html(new_val + '');
            }
        });
    });

    return pubSub;
}

function Summary(uid) {
    var binder = new DataBinder(uid),

        smry = {
            attributes: {},

            // The attribute setter publish changes using the DataBinder PubSub
            set: function (attr_name, val) {
                this.attributes[attr_name] = val;
                binder.trigger(uid + ":change", [attr_name, val, this]);
            },

            get: function (attr_name) {
                return this.attributes[attr_name];
            },

            _binder: binder
        };

    // Subscribe to the PubSub
    binder.on(uid + ":change", function (evt, attr_name, new_val, initiator) {
        if (initiator !== smry) {
            smry.set(attr_name, new_val);
        }
    });

    return smry;
}