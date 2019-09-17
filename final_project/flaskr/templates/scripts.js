"use strict"

// spinner options
var opts = {
  lines: 13, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 0.1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#ffffff', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  speed: 1, // Rounds per second
  rotate: 0, // The rotation offset
  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
  direction: 1, // 1: clockwise, -1: counterclockwise
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: '0 0 1px transparent', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};

// Colors for different types of markers
const tempMarkerColor = 'gray';
const pendingMarkerColor = 'orange';
const approvedMarkerColor = 'green';
const rejectedMarkerColor = 'red';
let bikemap;

$(document).ready(function() {
    // When the website loads, need to have an instance of BikeMap made right away
    bikemap = new BikeMap();
    // Initialize map 
    bikemap.initBikeMap();
    
});

// Helper Function(s) TODO probably don't need emptyBikeState function
let emptyBikeState = function(params) {
    // params = {
    //   latitude: float,
    //   longitude: float,
    //   address: string,
    //   uniqueId: interger,
    //   status: string,
    //   vote: {type: string, date: integer (unix time)}
    // }
    if ($.isEmptyObject(params)) {
        return {}
    }
    return {
        latitude: params.lat,
        longitude: params.lng,
        address: params.address,
        rackId: params.rackId,
        status: params.status,
        vote: params.vote.type,
        uid: params.userId
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
        // based on status
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
    
    // over the last week of votes, if 80% upvoted it, green 
    // if less than 80%, red
    // login authentication so that one person can only vote once
    // fix popup content size
    

    
    addVote() {
        // add a vote for a bikerack with particular id
        // update the voting information for a bikerack in the db
        // send a request to the database, we want to send the new voting
        // information to the database for a bikerack with particular
        // coordinates, TODO maybe we need to keep track of rack ids on 
        // the front end side as well somehow. we get a rack's coordinates
        // with the geosearch api, so where would we put the id. 
        
        // get rack from db
    }
    getRackVotes() {
        // look up all the votes for this bikerack (by id) 
    }
    removeOldVotes() {
        // Probably don't need this on the UI side
        // remove old votes for bikerack (past a certain date)
    }
    updateRackStatus() {
        // update rack status based on votes
    }
    deleteAllVotes() {
        // delete all the votes for a bikerack (by id)
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
    let content = `<div id="address">${state.address}</div>
               <div id="coordinates"><span id="lat">${state.latitude}</span> <span>
                 <span id="coordinateComma">,</span>
                 </span> <span id="lng">${state.longitude}</span>
               </div>
               <div id="options">
                 `
                 
    if (state.address === null || state.address === undefined) {
        state.address = ""
    }
    // if user is online and this isn't a temporary marker include the submit button and the voting buttons
    if (state.userId && !state.temp) {
        let arrows = arrowHTML(state.rack_id);
        //content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
        content += arrows;
    }
    // if the user is online and this IS a temporary marker include only the submit button
    else if (state.userId && state.temp) {
        content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
    }
    // if the user is not online then don't include any buttons (doesn't matter if temp marker or not)
    else {content += `</div> <!-- /#options -->`}
    
    return `<div class="popup"> ${content} </div>`
   
};

class BikeMap {
    constructor(mymap) {
        // show mountain view for now
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);
        // set map to display user's current location
        //this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        this.marker;
        
        
        this.allRacks = L.featureGroup([]);
        this.allRacks.on('click', (e) => {
            this.removeMarker(this.tempMarker);
            e.target.openPopup()});
        
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
        this.$signOutButton = $('#sign-out');
        this.$signInButton = $('#sign-in');
        
        // click bindings
        this.$signOutButton.click(this.signOut.bind(this));
        this.$signInButton.click(this.signIn.bind(this));
        
        this.mymap.on('click', this.onMapClick.bind(this));
        
        
        this.$myMap.on('click', '#submitButton', function(e) {
            
            this.submitBikeRack(e, this.buildRack.bind(this));
            
        }.bind(this));
        
        // arrow click binding
        this.$myMap.on('click', '.arrowClick', function(e) {
            console.log("vote!");
            console.log(e)
            console.log(e.target);
            console.log(e.currentTarget);
            console.log(e.target.id);
            // TODO
            // when a user clicks on an arrow, we need to figure out if it
            // was the downvote arrow or the upvote arrow which we can do with
            // e.target.id
            // then, we need to disable the clicking functionality (remove
            // the arrowClick class) for the 
            // arrow that was clicked, and also add the 'voted' class to it
            // and remove the arrowHover class from it
            
            // to summarize:
            // remove: .arrowClick, .arrowHover
            // add: .voted
            
            // BUT also, need to check if a vote was already made on this rack
            // so first we will run a function that queries the database for
            // the rack that received a votes so we need the rack_id
            
            
            // the user can now only click on the opposite arrow for that rack
        }.bind(this));
        
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
    
    // request data on all racks in the database, make bikerack instances of them
    // create markers for them and show them on the map
    this.loadRacks(this.showMarkers.bind(this)); 
    
    // initialize the search bar
    this.provider = new GeoSearch.OpenStreetMapProvider();
    
    this.searchControl = new GeoSearch.GeoSearchControl({
        provider: this.provider,
        style: 'bar',
        autoComplete: true,
        autoCompleteDelay: 250,
        retainZoomLevel: true
    }).addTo(this.mymap);
    
    // this should use .getContainer() instead of elements.container but
    // it doesn't work
    // https://github.com/smeijer/leaflet-geosearch/issues/169
    this.searchControl.elements.container.onclick = (e) => e.stopPropagation();
    
    // when someone searches an address and presses enter or clicks on the 
    // address in the search bar, add a temporary (gray) marker at that location
    this.mymap.on('geosearch/showlocation', (e) => {
        let lat = e.location.y,
            lng = e.location.x,
            address = e.location.label;
            
        this.addTempMarker(lat, lng, address);
    })
    
    // Initialize Firebase
    this.initFirebase();

};

BikeMap.prototype.initFirebase = function() {
    // Initialize Firebase authentication
    firebase.initializeApp(firebaseConfig);
    
    // shortcut to firebase SDK features
    this.auth = firebase.auth();
    
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
    
};

BikeMap.prototype.onAuthStateChanged = function(user) {
    if (user) { // user is signed in
        console.log(user.uid);
        // show sign out button
        this.$signOutButton.removeAttr('hidden');
        // hide sign in button
        this.$signInButton.attr('hidden', true);
        
        // TODO load map with UI for online users (buttons available for
        // submitting and voting)
        
        // first things first, reload the map
        this.loadRacks(this.showMarkers.bind(this), user.uid); 
        
        
    }
    else { // user is signed out 
        // Hide sign out button
        this.$signOutButton.attr('hidden', true);
        // show sign in button
        this.$signInButton.removeAttr('hidden');
        
        // TODO disable add bike rack and voting buttons
    }
    
}

BikeMap.prototype.signIn = function() {
    let provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithRedirect(provider);
}

BikeMap.prototype.signOut = function() {
    
    this.auth.signOut();
}


BikeMap.prototype.loadRacks = function(callback, uid) {
    // get data on ALL the markers in the database
    // when user visits page, map will load with ALL markers on it
    // callback is a function for processing of the data once retrieved from
    // the database
    let allRacksPromise = this.getRacks();
    allRacksPromise.done((data) => {
        callback(data, uid);
    })
};

BikeMap.prototype.buildRack = function(state) {
    // build a rack from creating an instance of bikeRack to creating
    // a marker for it, and adding that marker to the map
    // remove temp rack, because it's about to be replaced
    this.removeMarker(this.tempMarker);
    // we do createBikeRack which creates an instance of bikerack which
    // is where we keep track of what color the marker will be (but that's
    // basically it so maybe we want to just include this functionality in
    // the bikemap class TODO)
    this.createBikeRack(state);
    let marker = this.createMarker(state);
    // add marker to the map
    this.addMarker(marker);
    // add an id to the marker element
    marker._icon.id = state.rack_id;
    // open its popup
    marker.openPopup();
};


BikeMap.prototype.submitBikeRack = function(e, callback) {
    // first of all, check if user is signed in 
    if (!this.auth.currentUser) {
        // redirect user to sign in
        this.signIn()
        
    }
    else {
        // this means the user is signed in so proceed with the function

        console.log("user: " + JSON.stringify(this.auth.currentUser.uid));
        // send a request to the server, sending the coordinates of the
        // place on the map that was clicked
        
        // submit a location on the map for bike rack location consideration
        // it will be added to the database with a status of pending
        // as long as the coordinates are valid
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: {{ url_for('bikes.coordinates')|tojson }},
            data: {
                lat: $('#lat').text(),
                lng: $('#lng').text(),
                address: $('#address').text()
            },
            context: this
      }).done(function(state) {
          return callback(state);
      })
  }
};

BikeMap.prototype.createBikeRack = function(state) {
    // TODO figure out if this is even needed. When a rack is added to the map
    // an instance of BikeRack is created, but is never stored anywhere,
    // and is not used. 
    // create an instance of BikeRack and return it's state
    let bikerack = new BikeRack(state),
        iconColor = bikerack.setMarkerColor();
    
    // store this new bikerack in an array in BikeMaps constructor function
    // or in a variable in the constructor that is pointing to an instance
    // of BikeRackCollection? TODO 
    
    return bikerack.state;
} 
    
BikeMap.prototype.onMapClick = function (e) {

    // add the temporary  marker at coordinates
    // when the user clicks on the map, add a temporary marker there
    // then look up the address (which is async) and when that is 
    // finished, add the address to the popup content
    let userId = undefined,
        markerState;
    if (this.auth.currentUser) {
        userId = this.auth.currentUser.uid
    }
    
    let tempMarker = this.addTempMarker(e.latlng.lat, e.latlng.lng);
    let target = document.getElementById('address'),
            spinner = new Spinner(opts).spin(target);
    
    this.findAddress(e.latlng.lat, e.latlng.lng).then((address) => {
        markerState = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            address: address,
            rack_id: "",
            temp: true,
            userId: userId,
        }

        let content = popupContent(markerState);

        tempMarker.setPopupContent(content);
    })
}

BikeMap.prototype.findAddress = function(lat, lng) {
    // find address corresponding to lat, lng
    return new Promise((resolve, reject) => {
        this.provider.search({query: `${lat}, ${lng}`}).then((result) => {
            resolve(result[0].label);
        }) 
    });
};

BikeMap.prototype.addTempMarker = function(lat, lng, address) {
    // add a temporary marker, that is removed as soon as you click away
    //build icon
    
    let markerIcon = buildMarkerIcon(tempMarkerColor),
        markerState = {
            latitude: lat,
            longitude: lng,
            address: address,
            temp: true,
            rack_id: "",
        },
        content = popupContent(markerState);
        // if there is already a tempMarker, remove it
    if (this.tempMarker !== undefined) {
        this.mymap.removeLayer(this.tempMarker);
    }
            
    // add the temporary  marker at coordinates
    this.tempMarker = L.marker([lat, lng], {icon: markerIcon});
        
    this.tempMarker.addTo(this.mymap);
            
    // enable popup that shows address, 'add bike rack' button
    this.tempMarker.bindPopup(content).openPopup();
    
    return this.tempMarker;
}

BikeMap.prototype.createMarker = function(state) {
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

    let content = popupContent(state);
    marker.bindPopup(content);

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


BikeMap.prototype.showMarkers = function(data, uid) {
    // data is an array of bikerack states
    // add markers to map for these bikeracks
    for (let i=0; i<data.length; i++) {
        // make instances of BikeRack for each
        let bikerack = new BikeRack(data[i]);
        // TODO, store this information somewhere? And should I use
        // BikeRackCollection here?
        // create marker (handles what color the marker will be)
        bikerack.state.userId = uid;
        
        let marker = this.createMarker(bikerack.state)
        
        // add marker to map
        this.addMarker(marker);
        // add the rack_id as the marker element's id, this happens
        // after adding the marker to the map because if you try to do it
        // before, the marker doesn't exist yet. get undefined error
        marker._icon.id = bikerack.state.rack_id;
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




// -------------------------------@-------------------------------------

BikeMap.prototype.getRack = function(state) {
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
BikeMap.prototype.storeRack = function (state) {
    
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


