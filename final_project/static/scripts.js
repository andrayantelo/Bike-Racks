$( document ).ready(function() {
    // Initialize map        
    let mymap = L.map('mapid').setView([30.267153, -97.7430608], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(mymap);
    
    
    // add marker to map at barton hills park place
    let marker = L.marker([30.2623, -97.7740]).addTo(mymap);
  
});

// BikeRack class, do we need this?
class BikeRack {
    constructor() {
    }
}

function addMarker(lat, long) {
    // add marker at lat, long (for a bike rack)
}


