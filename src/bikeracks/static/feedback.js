const Feedback = (() => {
    // Feedback DOM elements
    const $feedbackModal = $('#feedbackModal');
    const $feedback = $feedbackModal.find('#feedback');
    const $submitFeedback = $feedbackModal.find('#submitFeedback');
    const $feedbackForm = $feedbackModal.find('#feedbackForm');
    const $closeFeedbackModal = $feedbackModal.find('#closeFeedbackModal');

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
        Notifications.notifyFeedbackSuccess();
    }

    function onError () {
        $closeFeedbackModal.trigger('click');
        Notifications.notifyFeedbackError();
    }
})()





