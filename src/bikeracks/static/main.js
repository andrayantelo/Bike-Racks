"use strict"

// spinner options
var opts = {
  lines: 13, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 0.1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#ffffff', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};

// Colors for different types of markers
const tempMarkerColor = 'gray';
const approvedMarkerColor = 'green';
const notApprovedMarkerColor = 'red';

let bikemap;

// Relevant DOM elements
const $sendSuggestionButton = $('#sendSuggestionButton');
const $submitFeedback = $('#submitFeedback');
const $removalReason = $('#removalReason');
const $feedbackForm = $('#feedbackForm');
const $feedback = $('#feedback');
const $closeFeedbackModal = $('#closeFeedbackModal');
const $closeRemovalModal = $('#closeRemovalModal');

// Options and settings for alerts
const errorOptions = {
    icon: 'glyphicon glyphicon-warning-sign',
    message: "Unable to send suggestion at this time."
};
const errorSettings = {type: "danger"};

const successOptions = {
    icon: 'glyphicon glyphicon-ok',
    message: "Suggestion sent. Thank you."
}

const successSettings = {type: "success"};

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
        },
        error: function() {
            $feedback.addClass('is-invalid');
        }
    });
}


function submitRemovalForm(e) {
    e.preventDefault();
    const rackId = $('#trashButton').data("rack_id"),
          removalId = $removalReason.children("option:selected").val(),
          userId = bikemap.auth.currentUser.uid;
    // need to send rack id and removal reason
    $.ajax({
        url:'/submitRemovalSuggestion',
        type:'POST',
        data: {
            rack_id: rackId,
            removal_id: removalId,
            user_id: userId
        },
        success:function(){
            // clear the form
            $closeRemovalModal.trigger('click');
            $.notify(successOptions, successSettings);
        },
        error: function() {
            $closeRemovalModal.trigger('click');
            $.notify(errorOptions, errorSettings);
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

    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    
});
