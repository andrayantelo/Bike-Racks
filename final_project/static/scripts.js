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
    
    
    // Make instance of BikeRackCollection
    //bikeRackCollection = new BikeRackColletion();
    
        
    // automatically add a mountain view library bike rack to bike rack collection class
    // for testing purposes Todo
  
});


// Todo probably need some kind of object (like my emptyCalendarState in
// other project) that stores relevant information of a bike rack (like lat
// and long), and this info can be used to create a BikeRack object, and it
// will be the object that is stored in our database (as a JSON object).


// checks if value is a valid latitudinal coordinate
let isLat = lat => !Number.isNaN(Number.parseFloat(lat)) && (lat <=90 && lat >=-90)

// checks if value is valid longitudinal coordinate
let isLong = long => !Number.isNaN(Number.parseFloat(long)) && (long <=180 && long >= -180)


let emptyBikeState = function(params) {
    // params = {
    //   lat: float,
    //    long: float
    // }
    if ($.isEmptyObject(params)) {
        return {}
    }
    //try {
    //    for (val in params) {
    //        isNumber(params[val])
    //    }
    //}
    //catch(e) {
    //    console.log("error " + e);
    //}
    //return {
    //    lat: params.lat,
    //    long: params.long
    //}
}

// BikeRack class
class BikeRack {
    constructor(lat, long) {
        let self = this;
        self.lat = lat;
        self.long = long;
        
        // shorcuts to DOM elements
        self.$addMarkerCard = $('#addMarkerCard');
        self.$addMarkerLink = $('#addMarkerLink');
        
        // Click handlers for the DOM
        //self.$addMarkerNavLink.click(self.addMarker.bind(self));
        self.$addMarkerLink.click(function() {
            alert( "Handler for .click() called." );
        });
       
    }



// A user should be able to add a marker somewhere, but it would be
// more like request to add a marker, then a preliminary marker is
// added in the location, and it will only become a fully fledged marker
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

}

// BikeRackCollection Class
class BikeRackCollection {
    constructor() {
        let self = this;
        
        self.bikeRackList = [];
    }
    
    addBikeRack() {
        // Add a bike rack to the collection Todo
        
    }
    
    removeBikeRack() {
        // Remove bike rack from the collection
    }
}


