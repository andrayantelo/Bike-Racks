const Notifications = (() => {
    
    const exports = {
        errorIcon : 'glyphicon glyphicon-warning-sign',
        successIcon : 'glyphicon glyphicon-ok',
        errorSettings : {type: "danger"},
        successSettings : {type: "success"}
    };
    // Options and settings for alerts
    // Success/error messages for submitting a bike rack removal suggestion
    const suggestionErrorMessage = "Sorry, unable to send suggestion at this time.";
    const  suggestionSuccessMessage = "Suggestion sent. Thank you.";
    // Success/error messages for submitting feedback

    
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

    exports.notifySubmitRemovalSuccess = () => {
        notifyMessage(
            successIcon,
            suggestionSuccessMessage,
            successSettings
        )
    }
    exports.notifySubmitRemovalError = () => {
        notifyMessage(
            errorIcon,
            suggestionErrorMessage,
            errorSettings
        )
    }
    return exports;
})()



