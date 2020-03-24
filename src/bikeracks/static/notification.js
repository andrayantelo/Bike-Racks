const Notifications = (() => {
    const exports = {
        // Options and settings for alerts
        // Success/error messages for submitting a bike rack removal suggestion
        suggestionErrorMessage: "Sorry, unable to send suggestion at this time.",
        suggestionSuccessMessage: "Suggestion sent. Thank you.",
        // Success/error messages for submitting feedback
        feedbackErrorMessage: "Sorry, unable to send feedback at this time.",
        feedbackSuccessMessage: "Thank you for your feedback.",
        // Success/error messages for voting on a bike rack
        voteErrorMessage: "Sorry, there was an error. Please try again later.",
        voteSuccessMessage: "Thank you for your vote.",
        // Success/error messages for submitting a bike rack
        submitBikeSuccess: "Thank you for adding a bike rack to the map.",
        submitBikeError: "Unable to add bike rack at this time. Please try again later.",
        errorIcon: 'glyphicon glyphicon-warning-sign',
        successIcon: 'glyphicon glyphicon-ok',
        errorSettings: {type: "danger"},
        successSettings: {type: "success"}
    }
    exports.renderMessage = (icon, message) => {
        return {
            icon,
            message
        }
    }
    const notifyMessage = (icon, message, settings) => {
        $.notify(
            exports.renderMessage(
                icon,
                message
            ),
            settings
        )
    }
    exports.notifyFeedbackSuccess = () => {
        notifyMessage(
            exports.successIcon,
            exports.feedbackSuccessMessage,
            exports.successSettings
        )
    }
    exports.notifyFeedbackError = () => {
        notifyMessage(
            exports.errorIcon,
            exports.feedbackErrorMessage,
            exports.errorSettings
        )
    }
    exports.notifySubmitRemovalSuccess = () => {
        notifyMessage(
            exports.successIcon,
            exports.suggestionSuccessMessage,
            exports.successSettings
        )
    }
    exports.notifySubmitRemovalError = () => {
        notifyMessage(
            exports.errorIcon,
            exports.suggestionErrorMessage,
            exports.errorSettings
        )
    }
    return exports;
})()



