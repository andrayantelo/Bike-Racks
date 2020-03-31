const Notifications = (() => {
    
    // Options and settings for alerts
    // Success/error messages for submitting a bike rack removal suggestion
    const suggestionErrorMessage = "Sorry, unable to send suggestion at this time.";
    const  suggestionSuccessMessage = "Suggestion sent. Thank you.";
    // Success/error messages for submitting feedback
    const feedbackErrorMessage = "Sorry, unable to send feedback at this time.";
    const feedbackSuccessMessage = "Thank you for your feedback.";
    const errorIcon = 'glyphicon glyphicon-warning-sign';
    const successIcon = 'glyphicon glyphicon-ok';
    const errorSettings = {type: "danger"};
    const successSettings = {type: "success"};
    
    const renderMessage = (icon, message) => {
        return {
            icon,
            message
        }
    }
    const notifyMessage = (icon, message, settings) => {
        $.notify(
            renderMessage(
                icon,
                message
            ),
            settings
        )
    }

    const exports = {};

    exports.notifyFeedbackSuccess = () => {
        notifyMessage(
            successIcon,
            feedbackSuccessMessage,
            successSettings
        )
    }
    exports.notifyFeedbackError = () => {
        notifyMessage(
            errorIcon,
            feedbackErrorMessage,
            errorSettings
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



