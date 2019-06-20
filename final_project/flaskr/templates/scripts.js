// Colors for different types of markers
const tempMarkerColor = 'gray';
const pendingMarkerColor = 'orange';
const approvedMarkerColor = 'green';
const rejectedMarkerColor = 'red';

$(document).ready(function() {
    
    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    // bind click function to the map element
    
    //bikemap.mymap.on('click', bikemap.onMapClick.bind(bikemap));
    //bikemap.mymap.on('click', $('#submitButton'), bikemap.addSubmit.bind(bikemap))
    
});



// Helper Functions
let emptyBikeState = function(params) {
    // params = {
    //   latitude: float,
    //   longitude: float,
    //   address: string,
    //   uniqueId: interger,
    //   status: string
    // }
    if ($.isEmptyObject(params)) {
        return {}
    }
    return {
        lat: params.lat,
        lng: params.lng,
        address: params.address,
        uniqueId: params.uniqueId,
        status: params.status
    }
};

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
        let markerColor;
        let status = this.state.status;
        if (status === "pending") {
            markerColor = pendingMarkerColor;
        }
        else if (status === "approved") {
            markerColor = approvedMarkerColor;
        }
        else if (status === "rejected") {
            markerColor = rejectedMarkerColor;
        }
        this.state.markerColor = markerColor;
        return markerColor;
    }

    addPhoto() {
    // Add photo of bike rack
    }

    addReview() {
    // Add bike rack review
    }

};


// BikeRackCollection Class
// Keeps track of all of the bikeracks on the page. Manipulate
// the html for a collection of bikeracks, instead of an individual bike
// rack
class BikeRackCollection {
    constructor() {
        // arrays of markers for bike racks
        this.markers = [];
        this.approvedMarkers = [];
        this.pendingMarkers = [];
        this.rejectedMarkers = [];
        
        // arrays of bike rack objects
        this.allRacks = [];
        this.approvedRacks = [];
        this.pendingRacks = [];
        this.rejectedRacks = [];
        
    }
    
    addBikeRack() {
        // Add a bike rack to the collection Todo
        
    }
    
    removeBikeRack() {
        // Remove bike rack from the collection
    }
};




//BikeMap is the class for the overall website. It will include functions
// that manipulate html, or add functionality
// like what?
// Like initializing the map

// BikeMap class helper functions
// temporary marker for when person clicks random spot on map
let tempMarker = {};



function buildMarkerIcon(markerColor) {
    return L.AwesomeMarkers.icon({
        prefix: 'fa',
        icon: 'bicycle',
        markerColor: markerColor
    });
};

function popupContent(lat, lng) {
    let content = 
        `<div id="tempForm">
           <div id="lat">${lat}</div> <span>,</span> <div id="lng">${lng}</div>
           <button id="submitButton" type="submit">Add Bike Rack</button>
        </div>
        `
    return content
};

class BikeMap {
    constructor(mymap) {
        // set map to display user's current location
        this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        this.allRacks = [];
        this.pendingRacks = [];
        this.approvedRacks = [];
        this.rejectedRacks = [];

        // DOM elements
        //this.$myMap = $('#mapid');
        //this.$submitButton = $('#submitButton');
        //this.$showApproved = $('#showApproved');
        //this.$showPending = $('#showPending');
        //this.$showRejected = $('#showRejected');
        
        // click handlers
        // add submit button click handler
        
        this.mymap.on('click', this.onMapClick.bind(this));
        $('#mapid').on('click', '#submitButton', this.addSubmit.bind(this))
        
        $('#showApproved').on('click', this.getApprovedRacks.bind(this));
        $('#showPending').on('click', this.getPendingRacks.bind(this));
        $('#showRejected').on('click', this.getRejectedRacks.bind(this));
        
    }
};
    
BikeMap.prototype.initBikeMap = function () {
    console.log("Initializing BikeRax");
       
 
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(this.mymap);
    
    
   
       
    // add marker to map at Mountain View Public Librarys TODO, remove later
    let approvedIcon = buildMarkerIcon(approvedMarkerColor),
        marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(this.mymap);
    
    // request data on all racks in the database, make BikeRackCollection object,
    // store all rack information in the arrays of BikeRackCollection object
    // TODO do I need a separate class here? BikeRackCollection
    let allRacks = this.getRacks();
    allRacks.done((data) => {
        // TODO is the below an ok way to do it
        this.allRacks = data;
    });
    
    this.loadMarkers();
}

BikeMap.prototype.loadMarkers = function() {
    // when user visits page, map will load with ALL markers on it
    let racks = this.getRacks();
    racks.done((data) => {
        this.showMarkers(data);
    })
    
};


BikeMap.prototype.addSubmit = function(e) {
    // send a request to the server, sending the coordinates of the
    // place on the map that was clicked
    console.log("add bike rack button clicked");
    console.log(this) 
    
    e.preventDefault();
    $.ajax({
        method: 'POST',
        url: {{ url_for('bikes.coordinates')|tojson }},
        data: {
            lat: $('#lat').text(),
            lng: $('#lng').text()
        },
        context: this
  }).done(function(data) {
      this.processBikeRack(data);
  })
}

BikeMap.prototype.processBikeRack = function(data) {
    // the coordinates 
    //  - if it's an approved rack:
    //    then a green marker needs to popup (with no 'add bike rack'
    //    button)
    //  - if it's a rejected rack:
    //    then a red marker needs to popup (with voting buttons)
    //  - if it's a pending rack:
    //    orange marker with voting buttons
    //  - otherwise it's a grey marker with 'add bike rack' button
    // 

      let bikerack = new BikeRack(data[1])
      let iconColor = bikerack.setMarkerColor(bikerack.state.status);
      
      this.addMarker(bikerack.state);
}
    
BikeMap.prototype.onMapClick = function (e) {

    // add the temporary  marker at coordinates
    this.addTempMarker(e.latlng.lat, e.latlng.lng, tempMarkerColor, this.mymap)
}

BikeMap.prototype.addTempMarker = function(lat, lng) {
    // add a temporary marker, that is removed as soon as you click away
    //build icon
    let markerIcon = buildMarkerIcon(tempMarkerColor);
    // if there is already a tempMarker, remove it
    if (tempMarker !== undefined) {
        this.mymap.removeLayer(tempMarker);
    }
        
    // add the temporary  marker at coordinates
    tempMarker = L.marker([lat, lng], {icon: markerIcon});
    
    tempMarker.addTo(this.mymap);
        
    let content = popupContent(lat, lng);
        
    // enable popup that shows coordinates and 'add bike rack' button
    tempMarker.bindPopup(content).openPopup();
}

BikeMap.prototype.addMarker = function(state) {
    // add marker of type pending, approved, or rejected that is not removed
    // when user clicks away (but is removed if user clicks on hide all temporary,
    // hide all approved, etc
    //build icon
    let markerIcon = buildMarkerIcon(state.markerColor),
        content = popupContent(state.latitude, state.longitude),
        marker;
    // create marker at coordinates
    marker = L.marker([state.latitude, state.longitude], {icon: markerIcon});
    // bind pop up
    marker.bindPopup(content);
    // click handler
    marker.on('click', function() {
        this.openPopup();
    })
    
    // add marker to map
    marker.addTo(this.mymap);
    
}


BikeMap.prototype.removeMarker = function(lat, lng) {
    // remove markers at lat, lng TODO
    
}

BikeMap.prototype.getPendingRacks = function() {
    // make request for pending bike racks
    
    $.ajax({
        method: 'GET',
        url: {{ url_for('bikes.get_racks', status="pending")|tojson }},
        context: this
    }).done(function(data) {
        this.showMarkers(data);
    })
}

BikeMap.prototype.getApprovedRacks = function() {
    // make ajax request for approved bike racks
    $.ajax({
        method: 'GET',
        url: {{ url_for('bikes.get_racks', status="approved")|tojson }},
        context: this,
        
    }).done(function(data) {
        this.showMarkers(data);
    })
}

BikeMap.prototype.getRejectedRacks = function() {
    // Hide all markers except for rejected markers on map
    $.ajax({
        method: 'GET',
        url: {{ url_for('bikes.get_racks', status="rejected")|tojson }},
        context: this,
    }).done(function(data) {
        this.showMarkers(data);
    })
}

BikeMap.prototype.getRacks = function() {
    // get markers with status= 'approved', 'pending', 'rejected', or
    // if not specified, get all markers TODO change the default for status
    console.log("running getRacks");
    
    // get data on all of the bike racks stored in the database
    return $.ajax({
        method: 'GET',
        url: {{ url_for('bikes.get_racks')|tojson }},
        context: this,
    })
}


BikeMap.prototype.showMarkers = function(data) {

    // Hike all markers except for approved markers on map
    for (let i=0; i<data.length; i++) {
        // make instances of BikeRack for each
        let bikerack = new BikeRack(data[i]);
        // TODO, store this information somewhere? And should I use
        // BikeRackCollection here?
        // now add marker
        this.addMarker(bikerack.state);
    }
}



