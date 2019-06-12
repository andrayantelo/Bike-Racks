// Leaflet Map
let mymap;

// Markers for map
let markers = []; 

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
    
    bikemap.mymap.on('click', bikemap.onMapClick.bind(bikemap)); 
    
});



// Helper Functions

// checks if value is a valid latitudinal coordinate
let isLat = lat => !Number.isNaN(Number.parseFloat(lat)) && (lat <=90 && lat >=-90);

// checks if value is valid longitudinal coordinate
let isLong = long => !Number.isNaN(Number.parseFloat(long)) && (long <=180 && long >= -180);


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
    if (!(isLat(params.latitude) && isLong(params.longitude))) {
        return {}
    }
    return {
        lat: params.latitude,
        lng: params.longitude,
        address: params.address,
        uniqueId: params.uniqueId,
        status: params.status
    }
};

// BikeRack class
class BikeRack {
    constructor(state) {
        let self = this;
        self.state = state;
    }

// A user should be able to add a marker somewhere, but it would be
// more like request to add a marker, then a preliminary marker (maybe
// yellow in color) is
// added in the location, and it will only become a fully fledged marker (green)
// when enough people verify that a bike rack actually exists at that
// location. have an option to show all pending/hide all pending
// in the navbar, approved always visible?
    setMarkerColor(status) {
        let markerColor;
        if (status === "pending") {
            console.log("pending");
            markerColor = pendingMarkerColor;
        }
        else if (status === "approved") {
            console.log("approved");
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
// the html for the collection of bikeracks, instead of an individual bike
// rack
class BikeRackCollection {
    constructor() {
        let self = this;
        
        self.approvedBikeRacks = [];
        self.pendingBikeRacks = [];
        self.rejectedBikeRacks = [];
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
}

class BikeMap {
    constructor(mymap) {
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);
        
        // click handlers
        // add submit button click handler
        $('#mapid').on('click', '#submitButton', this.addSubmit.bind(this));
        
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
    let approvedIcon = buildMarkerIcon(approvedMarkerColor);
    let marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(this.mymap);
    
        
}

BikeMap.prototype.validateCoordinates = function(lat, lng) {
    // Any time a user clicks on the map, a few things need to be checked
    // about the coordinates:
    //     - are the coordinates valid coordinates
    //     - are the coordinates land coordinates (and not ocean coordinates)
    //     - are the coordinates already in the database
    //         - if they are and it's an approved rack:
    //             then a green marker needs to popup (with no 'add bike rack'
    //             button)
    //         - if they are and it's a rejected rack:
    //             then a red marker needs to popup (with voting buttons)
    //         - if they are and it's a pending rack:
    //             orange marker with voting buttons
    //         - if they are not, then it's a grey marker with 'add bike rack' button
}

BikeMap.prototype.addSubmit = function(e) {
    // send a request to the server, sending the coordinates of the
    // place on the map that was clicked
    console.log("add bike rack button clicked");
    console.log(this) // submit button
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
      console.log(data);
      
      this.processCoordinates(data);
  })
}

BikeMap.prototype.processCoordinates = function(data) {
      // make an instance of bikerack
      console.log(data);
      
      let bikerack = new BikeRack(data[1])
      let iconColor = bikerack.setMarkerColor(bikerack.state.status);
      console.log(bikerack.state);
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
        marker;
  
    // add the temporary  marker at coordinates
    marker = L.marker([state.latitude, state.longitude], {icon: markerIcon});
    marker.addTo(this.mymap);
        
    let content = popupContent(state.latitude, state.longitude);
        
    // enable popup that shows coordinates and 'add bike rack' button
    tempMarker.bindPopup(content).openPopup();
    
}

BikeMap.prototype.removeMarker = function(lat, lng) {
    // remove markers at lat, lng
}

BikeMap.prototype.showPendingMarkers = function() {
    // Hide all markers except for pending markers on map
}

BikeMap.prototype.showApprovedMarkers = function() {
    // Hike all markers except for approved markers on map
}

BikeMap.prototype.showRejectedMarkers = function() {
    // Hide all markers except for rejected markers on map
}
    
    

