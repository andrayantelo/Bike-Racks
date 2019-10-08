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
        let markerColor,
            status = this.state.upvote_count > this.state.downvote_count;
        
        if (status) {
            markerColor = approvedMarkerColor;
        }
        else if (!status) {
            markerColor = notApprovedMarkerColor;
        }
        
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

// for testing purposes
function storeRack(state) {
    
    $.ajax({
        method: 'POST',
        url: {{ url_for('bikes.store_rack')|tojson }},
        data: JSON.stringify({
            latitude: state.latitude,
            longitude: state.longitude,
            status: state.status,
            address: state.address,
            upvote_count: state.vote.upvote,
            downvote_count: state.vote.downvote
        }, null, '\t'),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        context: this
    }).done((data) => {
        console.log("printing data:");
        console.log(data);
    })
}









