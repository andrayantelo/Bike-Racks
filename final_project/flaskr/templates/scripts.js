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
    //bikemap.mymap.on('click', $('#submitButton'), bikemap.submitBikeRack.bind(bikemap))
    
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
        latitude: params.lat,
        longitude: params.lng,
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



/*this.$showApproved.on('click', function(e) {
            let racksP = this.getRacks("approved");
            // if the map is showing approved markers then remove them 
            // from the map
        
            if (this.$showApproved.hasClass('onmap')) {
                console.log("#showApproved has class 'onmap'");
                racksP.done((racks) => this.removeMarkers(this.approvedRacks));
                // remove class onmap
                this.$showApproved.removeClass('onmap')
            }
            // if the map is not showing approved markers, add them to the map
            else {
                console.log("#showApproved does not have class 'onmap'");
                racksP.done((racks) => this.showMarkers(racks));
                this.$showApproved.addClass('onmap');
            }
        }.bind(this));

*/


class BikeMap {
    constructor(mymap) {
        // show mountain view for now
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);
        // set map to display user's current location
        //this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        this.marker;
        
        
        this.allRacks = L.featureGroup([]);
        this.allRacks.on('click', (e) => e.target.openPopup());
        
        this.pendingRacks = L.featureGroup([]);
        this.approvedRacks = L.featureGroup([]);
        this.rejectedRacks = L.featureGroup([]);
        
        // temporary marker for when person clicks on random spot on map
        this.tempMarker = {};

        // DOM elements
        this.$myMap = $('#mapid');
        this.$showApproved = $('#showApproved');
        this.$showPending = $('#showPending');
        this.$showRejected = $('#showRejected');
        
        // click bindings
        this.mymap.on('click', this.onMapClick.bind(this));
        this.$myMap.on('click', '#submitButton', function(e) {
            
            this.submitBikeRack(e, this.createBikeRack.bind(this));
        }.bind(this));
        
        // TODO, work on below toggling click handler
        this.$showApproved.on('click', function(e) {
            this.toggleMarkers("approved", this.$showApproved, this.approvedRacks);
        }.bind(this));
        
        this.$showPending.on('click', function(e) {
            this.toggleMarkers("pending", this.$showPending, this.pendingRacks);
        }.bind(this));
        
        this.$showRejected.on('click', function(e) {
            this.toggleMarkers("rejected", this.$showRejected, this.rejectedRacks);
        }.bind(this));

    }
};
    
BikeMap.prototype.initBikeMap = function () {
    console.log("Initializing BikeRax");
       
    // add a tile layer to the map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(this.mymap);
    
    
   
       
    // add marker to map at Mountain View Public Librarys TODO, remove later
    let approvedIcon = buildMarkerIcon(approvedMarkerColor);
    this.marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(this.mymap);
    
    // request data on all racks in the database, make BikeRackCollection object,
    // store all rack information in the arrays of BikeRackCollection object
    // TODO do I need a separate class here? BikeRackCollection
    
    this.loadRacks(this.showMarkers.bind(this)); 
}

BikeMap.prototype.loadRacks = function(callback) {
    // get data on ALL the markers in the database
    // when user visits page, map will load with ALL markers on it
    let allRacksPromise = this.getRacks();
    allRacksPromise.done((data) => {
        callback(data);
    })
    
};

BikeMap.prototype.submitBikeRack = function(e, callback) {
    // send a request to the server, sending the coordinates of the
    // place on the map that was clicked
    
    // submit a location on the map for bike rack location consideration
    // it will be added to the database as long as the coordinates are valid
    console.log("add bike rack button clicked");
    
    e.preventDefault();
    $.ajax({
        method: 'POST',
        url: {{ url_for('bikes.coordinates')|tojson }},
        data: {
            lat: $('#lat').text(),
            lng: $('#lng').text()
        },
        context: this
  }).done(function(state) {
      callback(state);
  })
}

BikeMap.prototype.createBikeRack = function(state) {
    // create an instance of BikeRack and return it's state
    console.log("creating bike rack");
    
    let bikerack = new BikeRack(state),
        iconColor = bikerack.setMarkerColor();
        
    // store this new bikerack in an array in BikeMaps constructor function
    // or in a variable in the constructor that is pointing to an instance
    // of BikeRackCollection? TODO 
    
    return bikerack.state;
} 
    
BikeMap.prototype.onMapClick = function (e) {

    // add the temporary  marker at coordinates
    this.addTempMarker(e.latlng.lat, e.latlng.lng, tempMarkerColor, this.mymap)
}

BikeMap.prototype.addTempMarker = function(lat, lng) {
    // add a temporary marker, that is removed as soon as you click away
    //build icon
    let markerIcon = buildMarkerIcon(tempMarkerColor),
        content = popupContent(lat, lng);
    // if there is already a tempMarker, remove it
    if (this.tempMarker !== undefined) {
        this.mymap.removeLayer(this.tempMarker);
    }
        
    // add the temporary  marker at coordinates
    this.tempMarker = L.marker([lat, lng], {icon: markerIcon});
    
    this.tempMarker.addTo(this.mymap);
        
    // enable popup that shows coordinates and 'add bike rack' button
    this.tempMarker.bindPopup(content).openPopup();
}

// TODO maybe have split functions, create marker, and addMarker (to map)
// inside createMarker the marker will need to be added to a featureGroup
// depending on it's status

// TODO Figure out binding of popups, is it possible to do it via the featureGroup?
// after that is figured out, remove uneeded and commented out functions, and
// then implement functions that remove markers from the map using the featureGroup

BikeMap.prototype.createMarker = function(state) {
    console.log("running createMarker");
    let markerIcon = buildMarkerIcon(state.markerColor),
        marker;
    
    marker = L.marker([state.latitude, state.longitude], {icon: markerIcon});
    
    // add marker to allRacks feature group and its feature group based on status
    this.allRacks.addLayer(marker);
    if (state.status === "approved") {
        this.approvedRacks.addLayer(marker);
    }
    else if (state.status === "pending") {
        this.pendingRacks.addLayer(marker);
    }
    else if (state.status === "rejected") {
        this.rejectedRacks.addLayer(marker);
    }
    
    // bind popup to marker
    let content = popupContent(state.latitude, state.longitude);
    marker.bindPopup(content)

    return marker;
}

BikeMap.prototype.addMarker = function(marker) {
    // add given marker to map
    marker.addTo(this.mymap);
}

BikeMap.prototype.getRacks = function(status) {
    // send a request to the server for data on racks with status=status
    //e.preventDefault();

    let path = {{ url_for('bikes.get_racks')|tojson }},
        params = $.param({status: status});
        
    return $.ajax({
        method: 'GET',
        url: path + '?' + params,
        context: this,
    })
}


BikeMap.prototype.showMarkers = function(data) {
    console.log("running showMarkers");
    // Hike all markers except for approved markers on map
    for (let i=0; i<data.length; i++) {
        // make instances of BikeRack for each
        let bikerack = new BikeRack(data[i]);
        // TODO, store this information somewhere? And should I use
        // BikeRackCollection here?
        
        // create marker
        let marker = this.createMarker(bikerack.state)
        // add marker to map
        this.addMarker(marker);
    }
}

BikeMap.prototype.showMarker = function(marker) {
    // show individual marker on map
    this.mymap.addLayer(marker);
}

BikeMap.prototype.removeMarkers = function(markerGroup) {
    // remove markers only from map
    markerGroup.eachLayer(function(layer) {
        this.mymap.removeLayer(layer);
    }.bind(this));
}

BikeMap.prototype.removeMarker = function(marker) {
    // remove a single marker from the map
    this.mymap.removeLayer(marker);
}

BikeMap.prototype.toggleMarkers = function(status, selector, group) {
    let racksP = this.getRacks(status);
    // if the map is showing markers of status=status, remove them from map
    if (selector.hasClass('onmap')) {
        racksP.done((racks) => this.removeMarkers(group));
        // remove class onmap
        selector.removeClass('onmap');
    }
    // if the map is now showing markers of status=status, add them to map
    else {
        racksP.done((racks) => this.showMarkers(racks));
        selector.addClass('onmap');
    }
};

// for testing purposes
BikeMap.prototype.storeRack = function (state) {
    
    $.ajax({
        method: 'POST',
        url: {{ url_for('bikes.store_rack')|tojson }},
        data: JSON.stringify({
            latitude: state.latitude,
            longitude: state.longitude,
            status: state.status,
            address: state.address
        }, null, '\t'),
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        context: this
    }).done((data) => {
        console.log("printing data:");
        console.log(data);
    })
}



