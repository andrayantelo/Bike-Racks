const Notifications = (() => {
    
    const exports = {
        errorIcon : 'glyphicon glyphicon-warning-sign',
        successIcon : 'glyphicon glyphicon-ok',
        errorSettings : {type: "danger"},
        successSettings : {type: "success"}
    };

    const renderMessage = (icon, message) => {
        return {
            icon,
            message
        }
    }
    exports.notifyMessage = (icon, message, settings) => {
        $.notify(
            renderMessage(
                icon,
                message
            ),
            settings
        )
    }


    return exports;
})()



