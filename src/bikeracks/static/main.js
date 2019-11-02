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
const inBetweenMarkerColor = 'orange';

let bikemap;

function subForm (){
    $.ajax({
        url:'/submitFeedback',
        type:'POST',
        data:$('#feedbackForm').serialize(),
        success:function(){
            console.log("form submitted");
        }
    });
}

$(document).ready(function() {
    $('#submitFeedback').on('click', subForm);
    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    
});
