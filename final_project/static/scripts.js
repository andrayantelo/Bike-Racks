$( document ).ready(function() {
    // Initialize map        
    let mymap = L.map('mapid').setView([37.3861, -122.0839], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(mymap);
    
    
    // add marker to map at Mountain View Public Librarys
    let marker = L.marker([37.3903, -122.0836]).addTo(mymap);
  
});


// BikeRack class, do we need this?
class BikeRack {
    constructor(lat, long) {
        let self = this;
        self.lat = lat;
        self.long = long;
    }
}

// A user should be able to add a marker somewhere, but it would be
// more like request to add a marker, then a preliminary marker is
// added in the location, and it will only become a fully fledged marker
// when enough people verify that a bike rack actually exists at that
// location. There can only be a select number of preliminary markers
// on the map at a time, the rest are put in a backlog and will be placed
// on the map as markers get approved or rejected

function addMarker() {
    // add marker at lat, long (for a bike rack)
    
}

function markerInfo() {
    // When you click on a marker, you get info like
    // photos, user comments on bike rack,
    // if it is located in front of a building or behind
}

function addPhoto() {
    // Add photo of bike rack
}

function addReview() {
    // Add bike rack review
}

