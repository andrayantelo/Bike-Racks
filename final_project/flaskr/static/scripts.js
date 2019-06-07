// Leaflet Map
let mymap;

// Markers for map
let markers = []; 

// Colors for different types of markers
const tempMarkerColor = 'gray';
const pendingMarkerColor = 'yellow';
const approvedMarkerColor = 'green';
const rejectedMarkerColor = 'red';

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
           <button id="submitButton" type="submit">Submit</button>
        </div>
        `
    return content
}

function addMarker(lat, lng, markerColor, rackmap) {
    console.log("working on map " + rackmap);
    let markerIcon = buildMarkerIcon(markerColor);
    // if there is already a tempMarker, remove it
    if (tempMarker !== undefined) {
        rackmap.removeLayer(tempMarker);
    }
        
    // add the temporary  marker at coordinates
    tempMarker = L.marker([lat, lng], {icon: markerIcon});
    tempMarker.addTo(rackmap);
        
    let content = popupContent(lat, lng);
        
    // enable popup that shows coordinates and 'add bike rack' button
    tempMarker.bindPopup(content).openPopup();
}

$(document).ready(function() {
    
    
    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    // bind click function to the map element
    
    bikemap.mymap.on('click', bikemap.onMapClick); 
    
});



// Helper Functions

// checks if value is a valid latitudinal coordinate
let isLat = lat => !Number.isNaN(Number.parseFloat(lat)) && (lat <=90 && lat >=-90);

// checks if value is valid longitudinal coordinate
let isLong = long => !Number.isNaN(Number.parseFloat(long)) && (long <=180 && long >= -180);


let emptyBikeState = function(params) {
    // params = {
    //   lat: float,
    //   lng: float,
    //   address: string,
    //   uniqueId: interger,
    //   status: string
    // }
    if ($.isEmptyObject(params)) {
        return {}
    }
    if (!(isLat(params.lat) && isLong(params.long))) {
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
    addTempMarker() {
    // A temporary marker needs to be placed at the lat and long provided
    // by the input to this function
    

    }

    addMarker() {
    // add marker at lat, long (for a bike rack)
        console.log("Running addMarker");
        self.$addMarkerCard.css({display: flex});
    }

    markerInfo() {
    // When you click on a marker, you get info like
    // photos, user comments on bike rack,
    // if it is located in front of a building or behind
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

// temporary marker for when person clicks random spot on map
let tempMarker = {};

class BikeMap {
    constructor(mymap) {
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);;
        
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
    
BikeMap.prototype.onMapClick = function (e) {
    console.log("map clicked");
    console.log("lat: " + e.latlng.lat + " lng: " + e.latlng.lng);
    console.log(e.target);
    console.log(this.mymap);
    // TODO have to check if these coordinates already exist in the database
    // then if user is viewing approved only map, and they clicked on a pending
    // spot, the marker that pops up is yellow and not gray
        
    // add a temporary marker on the spot the user clicked
        
    // add the temporary  marker at coordinates
    addMarker(e.latlng.lat, e.latlng.lng, tempMarkerColor, this.mymap)
}
    
    

