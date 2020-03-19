"use strict"
// Relevant DOM elements
const $sendSuggestionButton = $('#sendSuggestionButton');
const $submitFeedback = $('#submitFeedback');
const $removalReason = $('#removalReason');
const $feedbackForm = $('#feedbackForm');
const $feedback = $('#feedback');
const $closeFeedbackModal = $('#closeFeedbackModal');
const $closeRemovalModal = $('#closeRemovalModal');

// subForm handles the request to submit feedback
function subForm (e){
    e.preventDefault();
    $.ajax({
        url:'/submitFeedback',
        type:'POST',
        data:$feedbackForm.serialize(),
        success:function(){
            // clear the form
            $feedback.val("");
            $closeFeedbackModal.trigger('click');
            $.notify(renderMessage(successIcon, feedbackSuccessMessage), successSettings);
        },
        error: function() {
            $closeFeedbackModal.trigger('click');
            $.notify(renderMessage(errorIcon, feedbackErrorMessage), errorSettings);
        }
    });
}

// Handles POST request to submit a suggestion to remove a bike rack
function submitRemovalForm(e) {
    e.preventDefault();
    // Gather data to be sent with request
    const rackId = $('#trashButton').data("rack_id"),
          reasonId = $removalReason.children("option:selected").val(),
          userId = bikemap.auth.currentUser.uid;

    $.ajax({
        url:'/submitRemovalSuggestion',
        type:'POST',
        data: {
            rack_id: rackId,
            reason_id: reasonId,
            user_id: userId
        },
        success:function(){
            // clear the form
            $closeRemovalModal.trigger('click');
            $.notify(renderMessage(successIcon, suggestionSuccessMessage), successSettings);
        },
        error: function() {
            $closeRemovalModal.trigger('click');
            $.notify(renderMessage(errorIcon, suggestionErrorMessage), errorSettings);
        }
    });
}

$(document).ready(function() {
    /*
    bind .click() inside of $(document).ready() to be certain that the element to which the
    .click() event is bound has been created when the function executes.
    */
    $submitFeedback.on('click', subForm);
    $sendSuggestionButton.on('click', submitRemovalForm);
    
    let bikemap;
    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    console.log(bikemap.allRacks);
    
});
