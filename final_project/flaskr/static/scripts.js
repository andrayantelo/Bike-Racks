// Leaflet Map
let mymap;

// Markers for map
let markers = []; 

// Colors for different types of markers
const tempMarkerColor = '#808080';
const pendingMarkerColor = '#FFD700';
const approvedMarkerColor = '#008000';
const rejectedMarkerColor = '#FF0000';

// temporary marker for when person clicks random spot on map
let tempMarker = {};

let tempIcon = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'bicycle',
    markerColor: 'gray'
});

let approvedIcon = L.AwesomeMarkers.icon({
    prefix: 'fa',
    icon: 'bicycle',
    markerColor: 'green'
});


$(document).ready(function() {
    // Initialize map        
    mymap = L.map('mapid').setView([37.3861, -122.0839], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(mymap);
    
    
    // add marker to map at Mountain View Public Librarys TODO, remove later
    let marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(mymap);
    
    // when you click on a random spot on the map
    // we need a temporary marker to be added there, like a 
    // gray one, have a popup show up with the coordinates
    // and a button that says "add bike rack"
    
    function onMapClick(e) {
        console.log("You clicked the map at " + e.latlng);
        
        // if there is already a tempMarker, remove it
        if (tempMarker !== undefined) {
            mymap.removeLayer(tempMarker);
        }
        
        tempMarker = L.marker([e.latlng.lat, e.latlng.lng], {icon: tempIcon});
        tempMarker.addTo(mymap);
    }
    
    mymap.on('click', onMapClick);
    
    
    // When the website loads, need to have an instance of BikeRax made right away
    //let bikerax = new BikeRax();
    
    
    // Make instance of BikeRackCollection
    //const bikeRackCollection = new BikeRackCollection();
    //console.log(JSON.stringify(bikeRackCollection.pendingBikeRacks));
    
    // when addMarker is clicked then we need to make a new emptyBikeState
    // for a bikeRack. 
    //$('#submitButton').click(function() {
    //    console.log("submit button clicked");
    //    console.log($('#latitude').val());
        // Need to validate and sanitize the latitude and longitude values
        // make a new emptyBikeState
        //let newBikeRack = emptyBikeState(
        
    //});
    
        
    // automatically add a mountain view library bike rack to bike rack collection class
    // for testing purposes Todo
    
    // Whenever the page is loaded, the map needs to be updated with new
    // markers
  
});

// when a user adds a marker they provide coordinates, maybe a title?
// address?

// Helper Functions

// checks if value is a valid latitudinal coordinate
let isLat = lat => !Number.isNaN(Number.parseFloat(lat)) && (lat <=90 && lat >=-90);

// checks if value is valid longitudinal coordinate
let isLong = long => !Number.isNaN(Number.parseFloat(long)) && (long <=180 && long >= -180);


let emptyBikeState = function(params) {
    // params = {
    //   lat: float,
    //   long: float
    // }
    if ($.isEmptyObject(params)) {
        return {}
    }
    if (!(isLat(params.lat) && isLong(params.long))) {
        return {}
    }
    return {
        lat: params.lat,
        long: params.long
    }
};

// BikeRack class
class BikeRack {
    constructor(lat, long) {
        let self = this;
        self.lat = lat;
        self.long = long;
        
        // shorcuts to DOM elements
        self.$submitCoordinatesButton = $('#submitCoordinatesButton');
        
        
        // Click handlers for the DOM
        //self.$addMarkerNavLink.click(self.addMarker.bind(self));
        //self.$submitCoordinatesButton.click(function() {

       
    }



// A user should be able to add a marker somewhere, but it would be
// more like request to add a marker, then a preliminary marker (maybe
// yellow in color) is
// added in the location, and it will only become a fully fledged marker (green)
// when enough people verify that a bike rack actually exists at that
// location. There can only be a select number of preliminary markers
// on the map at a time, the rest are put in a backlog and will be placed
// on the map as markers get approved or rejected

    addMarker() {
    // add marker at lat, long (for a bike rack)
    // When Add Marker is clicked on the navbar, make #addMarker card
    // visible
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

//BikeRax is the class for the overall website. It will include functions
// that manipulate html, or add functionality
class BikeRax {
    constructor() {
        let self = this;
        
        self.initBikeRax();
    }
    
    initBikeRax() {
        console.log("Initializing BikeRax");
        // Load BikeRackCollection state from storage
    }
};
