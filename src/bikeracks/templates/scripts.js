"use strict"


class BikeMap {
    constructor(mymap) {
        // show mountain view for now
        this.mymap = L.map('mapid', { 
            zoomControl: false
        }).locate({setView:true, maxZoom: 16});
        
        L.control.locate().addTo(this.mymap);
        // set map to display user's current location
        //this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        
        this.marker;
        // markers clustergroup
        this.markers = L.markerClusterGroup();
   
        this.allRacks = L.featureGroup([]);
        this.allRacks.on('click', (e) => {
            this.mymap.removeLayer(this.tempMarker);
            this.marker = e.sourceTarget;
            
            e.target.openPopup();
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
       
    // add a tile layer to the map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 21,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(this.mymap);
    
    L.control.zoom({
        position: 'topleft'
    }).addTo(this.mymap);
    
       
    // add marker to map at Mountain View Public Librarys TODO, remove later
    //let approvedIcon = buildMarkerIcon(approvedMarkerColor);
    //this.marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(this.mymap);
    
    // initialize the search bar
    this.provider = new GeoSearch.OpenStreetMapProvider();
    
    this.searchControl = new GeoSearch.GeoSearchControl({
      provider: this.provider, 
      style: 'bar',                              
      showMarker: true, 
      marker: {                                           	
        icon: new L.Icon.Default(),	
        draggable: false,	
      },	
      showPopup: false, 
      maxMarkers: 1,                                      
      retainZoomLevel: false,                             
      animateZoom: true,                                  
      autoClose: true,                                   
      searchLabel: 'Enter address',                       
      keepResult: true                                 
    }).addTo(this.mymap);
    
    // this should use .getContainer() instead of elements.container but
    // it doesn't work
    // https://github.com/smeijer/leaflet-geosearch/issues/169
    this.searchControl.elements.container.onclick = (e) => e.stopPropagation();
    //this.searchControl.getContainer().onclick =(e) => e.stopPropagation();

    // Initialize Firebase
    this.initFirebase();
    
    // empty the allRacks featureGroup
    this.allRacks.clearLayers();
    
    // add marker to map (by adding the cluster group)
    this.mymap.addLayer(this.markers)

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
        

        // first things first, reload the map
        this.loadMap(user.uid); 
        
        
    }
    else { // user is signed out 
        // Hide sign out button
        this.$signOutButton.attr('hidden', true);
        // show sign in button
        this.$signInButton.removeAttr('hidden');
        
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
    
    this.getRacks(userId).done((data) => {
        return this.buildRacks(data, userId);
    });
    
};

BikeMap.prototype.getRacks = function(userId, status) {
    // send a request to the server for data on racks with status=status
    //e.preventDefault();

    let path = {{ url_for('bikes.get_racks')|tojson }},
        params = $.param({userId: userId, status: status});
        
    return $.ajax({
        method: 'GET',
        url: path + '?' + params
    });
};

BikeMap.prototype.buildRacks = function(states, userId) {
    // create an instances of BikeRack for all the states in states
    
    let bikeracks = [];

    if (!Array.isArray(states)) {
        states = [states];
    }
    for (let i=0; i<states.length; i++) {
        // incluse user id in the state
        //states[i].user_id = userId;
        // create instance of bike rack and set it's marker color
        let bikerack = new BikeRack(states[i]),
            iconColor = bikerack.setMarkerColor();
            
        // create a marker for bike rack
        let marker = this.createMarker(states[i]);
        
        
        //this.addMarker(marker);
        
        // open marker popup
        if (states.length === 1) {
            marker.openPopup();
        };
        
        
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
    
    let tempMarker = this.addTempMarker(e.latlng.lat, e.latlng.lng),
        target = document.getElementById('address'),
        spinner = new Spinner(opts).spin(target);
    
    this.findAddress(e.latlng.lat, e.latlng.lng).then((address) => {
        state = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
            address: address,
            rackId: "",
            upvoteCount: undefined,
            downvoteCount: undefined,
            userId: userId,
        }
        // remaking popup content here because we need to wait for the address
        // to be found
        let content = this.popupContent(state);

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
    
    let userId = this.auth.currentUser ? this.auth.currentUser.uid : "";

    let markerIcon = buildMarkerIcon(tempMarkerColor),
        markerState = {
            latitude: lat,
            longitude: lng,
            address: address,
            rackId: "",
            upvoteCount: undefined,
            downvoteCount: undefined,
            userId: userId
            
        },
        content = this.popupContent(markerState);
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
    let marker,
        content = this.popupContent(state),
        icon = buildMarkerIcon(state.markerColor);
    // if this marker already exists
    this.allRacks.eachLayer(layer => {
       if (layer.options.uniqueId === state.rack_id) {
          
           marker = layer;
       }
    });
   
    
    if (marker) {
        marker._popup.setContent(content);
    }
    else {
        // we didn't find a marker, make a new one
        marker = L.marker([state.latitude, state.longitude], {uniqueId: state.rack_id}); 
        // add marker to allRacks feature group and its feature group based on status
        this.allRacks.addLayer(marker);
        // true implies that this rack is approved
        if (isApproved(state)) {
            this.allApproved.addLayer(marker);
        }
        else {
            this.allNotApproved.addLayer(marker);
        }
        
        // bind popup to marker
        marker.bindPopup(content);
        // add marker to cluster group
        this.markers.addLayer(marker)
    
    }
    marker.setIcon(icon)
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
        // add the marker to the cluster group
        this.markers.addLayer(layer);
    }.bind(this))
}

BikeMap.prototype.removeMarkers = function(markerGroup) {
    // remove markers only from map
    markerGroup.eachLayer(function(layer) {
        // remove the marker from the cluster group
        this.markers.removeLayer(layer)
    }.bind(this));
}


BikeMap.prototype.toggleMarkers = function(status, selector, group) {
    
    let markerGroup = status === "approved" ? this.allApproved : this.allNotApproved;
    //let racksP = this.getRacks(status);
    // if the map is showing markers of status=status, remove them from map
    if (selector.attr('checked')) {
       this.removeMarkers(markerGroup);
       // and uncheck
       selector.removeAttr('checked')
    }
    // if the map is not showing markers of status=status, add them to map
    else {
        this.showMarkers(markerGroup);
        // and add the checked attribute
        selector.attr('checked', true);
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
    if (!this.auth.currentUser) {
        // redirect user to sign in
        bikemap.signIn()
        return
    }

        
    let rack_id = e.currentTarget.id.substring(2),
        user_id = this.auth.currentUser.uid,
        voteStatusP = this.getVoteStatus(rack_id, user_id),
        arrowDiv = e.target.id;

    // if the user already voted on this rack,
    // need to update their vote in the database, and the UI changes
    // that happen even if they didn't already make a vote still happen
    voteStatusP.then(voteStatus => {

            let oldVoteType = voteStatus ? voteStatus.vote_type : 0,
                newVote = e.target.dataset.votetype,
                voteToSubmit;
                
            let newVoteType = newVote === "upvote"? 1: -1;
             
             // if the new vote is the same as the old vote, unvote
            if (newVoteType === oldVoteType) {
                voteToSubmit = 0;
            }
            else {
            // just vote
                voteToSubmit = newVoteType
            }
                
            this.submitVote(rack_id, user_id, voteToSubmit);
            
    })
};

BikeMap.prototype.arrowHTML = function(state) { 
    let containerId = "rack_" + state.rack_id;
   
    let upvoteArrowClass = "fas fa-arrow-circle-up fa-2x arrow ",
        downvoteArrowClass = "fas fa-arrow-circle-down fa-2x arrow ",
        upvotePercentage = Math.floor((state.upvote_count/(state.upvote_count + state.downvote_count))*100),
        downvotePercentage = Math.floor((state.downvote_count/(state.upvote_count + state.downvote_count))*100);
        
        upvotePercentage = upvotePercentage? upvotePercentage: 0;
        downvotePercentage = downvotePercentage? downvotePercentage: 0;
    // if you have a voteStatus of 1 , which is an upvote, then you want
    // the upvote arrow to have a class of .voted, and you DON'T want it to have arrowHover and arrowClick
    // if you have a voteStatus of -1, which is a downvote, then you want the downvote arrow
    // to have a class of .voted, and you DON'T want it to have arrowHover and arrowClick
    // if there is no vote, then BOTH upvote and downvote arrows have arrowHover and arrowClick
    
    // if the state of the rack's user id matches the current user, then we need 
    // to include certain html for the arrows if they voted on this rack
    if (state.vote_type === undefined) {
        upvoteArrowClass += "arrowHover arrowClick";
        downvoteArrowClass += "arrowHover arrowClick";
    }
    else if (state.vote_type === 1) {
       upvoteArrowClass += "voted arrowClick";
       downvoteArrowClass += "arrowHover arrowClick";
    }
   else if (state.vote_type === -1) {
        downvoteArrowClass += "voted arrowClick";
        upvoteArrowClass += "arrowHover arrowClick";
    }
    // if the state's user id does NOT match the current user, then the user has not voted on this rack yet
    else {
        upvoteArrowClass += "arrowHover arrowClick";
        downvoteArrowClass += "arrowHover arrowClick";
    }
    

    return `<div id="options">
        <div class="arrowsContainer" id=${containerId}>         
            <div><i id=${"u-" + state.rack_id} data-votetype="upvote" class="${upvoteArrowClass}"></i>
              <span id=${"upvoteCount_" + state.rack_id}>${upvotePercentage}%</span>
            </div>
            <div><i id=${"d-" + state.rack_id} data-votetype="downvote" class="${downvoteArrowClass}"></i>
              <span id=${"downvoteCount_" + state.rack_id}>${downvotePercentage}%</span>
            </div>
        </div> <!-- /.arrowsContainer -->
   `
};


BikeMap.prototype.popupContent = function(state) {
    let onlineStatus,
        voterStatus;
    /* state : {
     *     address: address (string),
     *     latitude: latitude (string),
     *     longitude: longitude (string),
     *     rack_id: rack_id (string), determine if a marker is a temporary marker
     *         or not by if they have a rack_id or not
     *     user_id: user_id (string, empty string if user is not signed in)
    }*/
    if (state.address === null || state.address === undefined) {
        state.address = ""
    }
    let content = `<div id="address">${state.address}</div>
               <div id="coordinates"><span id="lat">${state.latitude}</span> <span>
                 <span id="coordinateComma">,</span>
                 </span> <span id="lng">${state.longitude}</span>
               </div>
               `
    
    // if user is online and this isn't a temporary marker include the submit button and the voting buttons
    if (isLoggedIn(this) && !isTemporary(state)) {
        // include the "suggest an edit" button
        const editButton = 
            `<div id="edit">
                <button type="button"
                 class="btn btn-link"
                 data-toggle="modal" data-target="#removalModal">
                 <i id="trashIcon" class="fas fa-trash-alt"></i>
                 </button>
            </div></div><!-- /#options -->`
        let arrows = this.arrowHTML(state);
        //content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
        content += arrows;
        content += editButton;
        
    }
    // if the user is online and this IS a temporary marker include only the submit button
    else if (isLoggedIn(this) && isTemporary(state) && state.address) {
        
        content += `<div id="options"><button id="submitButton" type="submit">Add Bike Rack</button></div>`
    }
    // if the user is not online then don't include any buttons (doesn't matter if temp marker or not)
    else {
        
        content += `</div> <!-- /#options -->`
    }
    
    return `<div class="popup"> ${content} </div>`
   
};

