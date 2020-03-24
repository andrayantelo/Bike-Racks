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

// BikeRack class
class BikeRack {
    constructor(state) {
        this.state = state;
        this.initBikeRack();
        

    }
    
    initBikeRack() {
        this.setMarkerColor();
    }

    setMarkerColor() {
        // based on upvote and downvote count
        let markerColor;
            
        markerColor = isApproved(this.state) ? approvedMarkerColor : notApprovedMarkerColor;
       
        this.state.markerColor = markerColor;
        
        return markerColor;
    }
    
    
};

//BikeMap is the class for the overall website. It will include functions
// Like initializing the map

// BikeMap class helper functions
function buildMarkerIcon(markerColor) {
    let icon;
    if (markerColor === notApprovedMarkerColor) {
        icon = 'exclamation'
    }
    else {
        icon = 'bicycle'
    }
    return L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: icon,
        markerColor: markerColor
    });
};

function isApproved(state) {
    // returns true if a rack is approved (more upvotes than downvotes)
    return state.upvote_count > state.downvote_count;
}

function isTemporary(state) {
    // returns true if a rack is a temporary rack (does not have a rack_id)
    return !state.rack_id;
}

function isLoggedIn(bikemap) {
    return Boolean(bikemap.auth.currentUser);
}

const getUserId = (auth) => {
    let userId;
    if (auth.currentUser) {
        userId = auth.currentUser.uid;
    }
    return userId;
}

const initSearchBar = (mapProvider) => {
    return new GeoSearch.GeoSearchControl({
        provider: mapProvider,
        style: 'bar',                       
        showMarker: true,
        marker: {                        	
          icon: new L.Icon.Default(),
          draggable: false,
        },	
        showPopup: false,
        maxMarkers: 1,                                 
        retainZoomLevel: false,                          
        animateZoom: true,                             
        autoClose: true,                             
        searchLabel: 'Enter address to find a bike rack',                     
        keepResult: true               
      });
}












