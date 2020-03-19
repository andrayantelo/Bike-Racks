"use strict"

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












