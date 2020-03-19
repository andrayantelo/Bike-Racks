// Options and settings for alerts
// Success/error messages for submitting a bike rack removal suggestion
const suggestionErrorMessage = "Sorry, unable to send suggestion at this time.";
const suggestionSuccessMessage = "Suggestion sent. Thank you.";

// Success/error messages for submitting feedback
const feedbackErrorMessage = "Sorry, unable to send feedback at this time.";
const feedbackSuccessMessage = "Thank you for your feedback.";

// Success/error messages for voting on a bike rack
const voteErrorMessage = "Sorry, there was an error. Please try again later."
const voteSuccessMessage = "Thank you for your vote."

// Success/error messages for submitting a bike rack
const submitBikeSuccess = "Thank you for adding a bike rack to the map."
const submitBikeError = "Unable to add bike rack at this time. Please try again later."

const errorIcon = 'glyphicon glyphicon-warning-sign';
const successIcon = 'glyphicon glyphicon-ok';

const renderMessage = (icon, message) => {
    return {
        icon,
        message
    }
}
const errorSettings = {type: "danger"};
const successSettings = {type: "success"};