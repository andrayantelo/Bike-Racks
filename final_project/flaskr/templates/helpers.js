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
        // based on status
        let markerColor,
            status = this.state.status;
        
        if (status === "approved") {
            markerColor = approvedMarkerColor;
        }
        else if (status === "rejected") {
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

function arrowHTML(rack_id) { 
    return `<div id="arrowsContainer">
              <div><i id=${"upvoteArrow_" + rack_id} class="fas fa-arrow-circle-up fa-2x arrowHover arrowClick"></i>
                      <span id=${"upvoteCount_" + rack_id}>0%</span><div>
                <div><i id=${"downvoteArrow_" + rack_id} class="fas fa-arrow-circle-down fa-2x arrowHover arrowClick"></i>
                      <span id=${"downvoteCount_" + rack_id}>0%</span></div>
                </div>
            </div> <!-- /#options -->`
};


function popupContent(state) {
    /* state : {
     *     address: address (string),
     *     latitude: latitude (string),
     *     longitude: longitude (string),
     *     rack_id: rack_id (string),
     *     status: string (is it a temp marker or not, can be determined based on whether this rack has a status or not),
     *     user_id: user_id (string, empty? (or undefined) if user is not signed in)
    }*/
    if (state.address === null || state.address === undefined) {
        state.address = ""
    }
    let content = `<div id="address">${state.address}</div>
               <div id="coordinates"><span id="lat">${state.latitude}</span> <span>
                 <span id="coordinateComma">,</span>
                 </span> <span id="lng">${state.longitude}</span>
               </div>
               <div id="options">`
    
    // if user is online and this isn't a temporary marker include the submit button and the voting buttons
    if (state.userId && state.status) {
        
        let arrows = arrowHTML(state.rack_id);
        //content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
        content += arrows;
    }
    // if the user is online and this IS a temporary marker include only the submit button
    else if (state.userId && !state.status) {
        
        content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
    }
    // if the user is not online then don't include any buttons (doesn't matter if temp marker or not)
    else {
        
        content += `</div> <!-- /#options -->`
    }
    
    return `<div class="popup"> ${content} </div>`
   
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








