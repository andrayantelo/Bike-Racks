"use strict"


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
    return L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'bicycle',
        markerColor: markerColor
    });
};

function isApproved(state) {
    // returns true if a rack is approved (more upvotes than downvotes)
    return state.upvote_count > state.downvote_count;
}


// -------------------------------@-------------------------------------
// for testing purposes

function getRack(state) {
    // Retrieve rack state from db based on rack_id
    let rack_id = state.rack_id
    let path = {{ url_for('bikes.get_single_rack')|tojson }},
        params = $.param({rack_id: rack_id});
        
    return $.ajax({
        method: 'GET',
        url: path + '?' + params,
        context: this,
    }).done(data => console.log(data))
        
}











