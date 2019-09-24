"use strict"


class BikeMap {
    constructor(mymap) {
        // show mountain view for now
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);
        // set map to display user's current location
        //this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
   
        this.allRacks = L.featureGroup([]);
        this.allRacks.on('click', (e) => {
            this.mymap.removeLayer(this.tempMarker);
            e.target.openPopup()
        });
        
        this.allApproved = L.featureGroup([]);
        this.allNotApproved = L.featureGroup([]);
   
        // temporary marker for when person clicks on random spot on map
        this.tempMarker = {};

        // DOM elements
        this.$myMap = $('#mapid');
        this.$showApproved = $('#showApproved');
        this.$showNotApproved = $('#showNotApproved');
        this.$signOutButton = $('#sign-out');
        this.$signInButton = $('#sign-in');
        
        // click bindings
        this.$signOutButton.click(this.signOut.bind(this));
        this.$signInButton.click(this.signIn.bind(this));
        
        this.mymap.on('click', this.onMapClick.bind(this));
        
        
        this.$myMap.on('click', '#submitButton', function(e) {
            
            this.submitBikeRack(e, this.buildRacks.bind(this));
            
        }.bind(this));
        
        // arrow click binding
        this.$myMap.on('click', '.arrowClick', function(e) {
            this.vote(e)
        }.bind(this));
        
        this.$showApproved.on('click', function(e) {
            this.toggleMarkers("approved", this.$showApproved, this.allApproved);
        }.bind(this));

        this.$showNotApproved.on('click', function(e) {
            this.toggleMarkers("not_approved", this.$showNotApproved, this.allNotApproved);
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
        // show sign out button
        this.$signOutButton.removeAttr('hidden');
        // hide sign in button
        this.$signInButton.attr('hidden', true);
        
        // TODO load map with UI for online users (buttons available for
        // submitting and voting)
        
        // first things first, reload the map TODO
        this.loadMap(user.uid); 
        
        
    }
    else { // user is signed out 
        // Hide sign out button
        this.$signOutButton.attr('hidden', true);
        // show sign in button
        this.$signInButton.removeAttr('hidden');
        
        // TODO disable add bike rack and voting buttons
        // reload the map again, so that popup buttons can be updated
        this.loadMap();
    }
    
}

BikeMap.prototype.signIn = function() {
    let provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithRedirect(provider);
}

BikeMap.prototype.signOut = function() {
    
    this.auth.signOut();
}

BikeMap.prototype.loadMap = function(userId) {
    // get states of all bikeracks from the db
    // make bikerack instances with the states
    // create markers for each bikerack
    // display on map
    this.getRacks().done((states) => {
        this.buildRacks(states, userId);
        
    })
};

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
};

BikeMap.prototype.buildRacks = function(states, userId) {
    // create an instances of BikeRack for all the states in states
    let bikeracks = [];

    if (!Array.isArray(states)) {
        states = [states];
    }
    for (let i=0; i<states.length; i++) {
        // incluse user id in the state
        states[i].userId = userId;
        // create instance of bike rack and set it's marker color
        let bikerack = new BikeRack(states[i]),
            iconColor = bikerack.setMarkerColor();
        // create a marker for bike rack
        let marker = this.createMarker(states[i]);
        // add marker to map
        this.addMarker(marker);
        // set marker element id
        marker._icon.id = states[i].rack_id;
        // open marker popup
        //marker.openPopup();
    }
    return bikeracks;
}


BikeMap.prototype.submitBikeRack = function(e, callback) {
    // first of all, check if user is signed in 
    if (!this.auth.currentUser) {
        // redirect user to sign in
        this.signIn()
        
    }
    else {
        // this means the user is signed in so proceed with the function
        let userId = this.auth.currentUser.uid;
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
          // remove temporary marker before building it's more permanent version
          this.mymap.removeLayer(this.tempMarker);
          return callback(state, userId);
      })
  }
};


    
BikeMap.prototype.onMapClick = function (e) {

    // add the temporary  marker at coordinates
    // when the user clicks on the map, add a temporary marker there
    // then look up the address (which is async) and when that is 
    // finished, add the address to the popup content
    let userId,
        state;
    if (this.auth.currentUser) {
        userId = this.auth.currentUser.uid
    }
    
    let tempMarker = this.addTempMarker(e.latlng.lat, e.latlng.lng, userId),
        target = document.getElementById('address'),
        spinner = new Spinner(opts).spin(target);
    
    this.findAddress(e.latlng.lat, e.latlng.lng).then((address) => {
        state = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            address: address,
            rackId: "",
            status: undefined,
            upvoteCount: undefined,
            downvoteCount: undefined,
            userId: userId,
        }
        // remaking popup content here because we need to wait for the address
        // to be found
        let content = popupContent(state);

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

BikeMap.prototype.addTempMarker = function(lat, lng, userId, address) {
    // add a temporary marker, that is removed as soon as you click away
    //build icon
    
    let markerIcon = buildMarkerIcon(tempMarkerColor),
        markerState = {
            latitude: lat,
            longitude: lng,
            address: address,
            status: undefined,
            rackId: "",
            upvoteCount: undefined,
            downvoteCount: undefined,
            userId: userId
            
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
        this.allApproved.addLayer(marker);
    }
    else if (state.status === "not_approved") {
        this.allNotApproved.addLayer(marker);
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



// functions having to do with toggling the markers on the map

BikeMap.prototype.showMarkers = function(markerGroup) {
    // show markers of markerGroup on map
    markerGroup.eachLayer(function(layer) {
        this.mymap.addLayer(layer);
    }.bind(this))
}

BikeMap.prototype.removeMarkers = function(markerGroup) {
    // remove markers only from map
    markerGroup.eachLayer(function(layer) {
        this.mymap.removeLayer(layer);
    }.bind(this));
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
        racksP.done((racks) => this.showMarkers(group));
        selector.addClass('onmap');
    }
};

// functions that have to do with voting
BikeMap.prototype.getVoteStatus = function(rack_id, user_id) {
    // query the votes database and find out if the rack with rack_id=rack_id
    // and user_id=user_id has a vote
    // returns a vote status or undefined
    let path = {{ url_for('votes.get_vote_status')|tojson }},
        params = $.param({rack_id: rack_id, user_id: user_id});
        
    return $.ajax({
        method: 'GET',
        url: path + '?' + params,
        context: this,
    })
}

BikeMap.prototype.submitVote = function(rack_id, user_id, vote_type) {
    // submit a vote to the database
    // rack_id: integer
    // user_id: string
    // vote_type: integer
    // the vote data gets returned
    let path = {{ url_for('votes.submit_vote')|tojson }},
        params = $.param({rack_id: rack_id, user_id: user_id, vote_type: vote_type});
        
    return $.ajax({
        method: 'POST',
        url: path +  '?' + params,
        context: this,
    }).done(data => {
        // reload the map
        this.loadMap(user_id);
    })
}


BikeMap.prototype.vote = function(e) {
    console.log('vote!');
    if (!this.auth.currentUser) {
        // redirect user to sign in
        bikemap.signIn()
    }
    else {
        console.log("user is signed in and voting");
    }
    
    
};


