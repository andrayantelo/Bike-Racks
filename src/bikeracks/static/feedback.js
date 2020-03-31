const Feedback = (() => {
    // Feedback DOM elements
    const $feedbackModal = $('#feedbackModal');
    const $feedback = $feedbackModal.find('#feedback');
    const $submitFeedback = $feedbackModal.find('#submitFeedback');
    const $feedbackForm = $feedbackModal.find('#feedbackForm');
    const $closeFeedbackModal = $feedbackModal.find('#closeFeedbackModal');
    const feedbackErrorMessage = "Sorry, unable to send feedback at this time.";
    const feedbackSuccessMessage = "Thank you for your feedback.";

    $submitFeedback.on('click', subForm);

    // subForm handles the request to submit feedback
    function subForm (e) {
        e.preventDefault();
        const userId = getUserId();
        $.ajax({
            url:'/submitFeedback',
            type:'POST',
            data: {
                feedback: $feedbackForm.serialize(),
                userId,
            },
            success: () => onSuccess(),
            error: () => onError()
        });
    }

    function onSuccess () {
        $feedback.val("");
        $closeFeedbackModal.trigger('click');
        notifyFeedbackSuccess();
    }

    function onError () {
        $closeFeedbackModal.trigger('click');
        notifyFeedbackError();
    }

    function notifyFeedbackSuccess() {
        Notifications.notifyMessage(
            Notifications.successIcon,
            feedbackSuccessMessage,
            Notifications.successSettings
        )
    }
    function notifyFeedbackError() {
        Notifications.notifyMessage(
            Notifications.errorIcon,
            feedbackErrorMessage,
            Notifications.errorSettings
        )
    }
})()





