const Suggestion = (() => {
    const exports = {};
    // Relevant DOM elements
    const $suggestRemovalModal = $('#removalModal');
    const $sendSuggestionButton = $suggestRemovalModal.find('#sendSuggestionButton');
    const $removalReason = $suggestRemovalModal.find('#removalReason');
    const $closeRemovalModal = $suggestRemovalModal.find('#closeRemovalModal');
    // notification messages
    const suggestionErrorMessage = "Sorry, unable to send suggestion at this time.";
    const  suggestionSuccessMessage = "Suggestion sent. Thank you.";

    // bind events
    $sendSuggestionButton.on('click', submitRemovalForm);

    // Handles POST request to submit a suggestion to remove a bike rack
    function submitRemovalForm(e) {
        e.preventDefault();
        // Gather data to be sent with request
        const rackId = $('#trashButton').data("rack_id"),
            reasonId = $removalReason.children("option:selected").val(),
            userId = firebase.auth().currentUser.uid;

        $.ajax({
            url:'/submitRemovalSuggestion',
            type:'POST',
            data: {
                rack_id: rackId,
                reason_id: reasonId,
                user_id: userId
            },
            success: () => onSuccess(),
            error: () => onError()
        });
    }

    function onSuccess () {
        // clear the form
        $closeRemovalModal.trigger('click');
        notifySubmitRemovalSuccess();
    }

    function onError () {
        $closeRemovalModal.trigger('click');
        notifySubmitRemovalError();
    }

    function notifySubmitRemovalSuccess () {
        Notifications.notifyMessage(
            Notifications.successIcon,
            suggestionSuccessMessage,
            Notifications.successSettings
        )
    }
    
    function notifySubmitRemovalError () {
        Notifications.notifyMessage(
            Notifications.errorIcon,
            suggestionErrorMessage,
            Notifications.errorSettings
        )
    }
})()
