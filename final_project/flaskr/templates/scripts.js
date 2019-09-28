"use strict"


class BikeMap {
    constructor(mymap) {
        // show mountain view for now
        this.mymap = L.map('mapid').setView([37.3861, -122.0839], 13);
        // set map to display user's current location
        //this.mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        
        this.marker;
   
        this.allRacks = L.featureGroup([]);
        this.allRacks.on('click', (e) => {
            this.mymap.removeLayer(this.tempMarker);
            this.marker = e.sourceTarget;
            console.log('clicked on: ');
            console.log(this.marker);
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
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYW5kcmF5YW50ZWxvIiwiYSI6ImNqczB1YTJ6ajFuNGo0M2x2eTVpNms1MHEifQ.1SbExoA1iGNdOKDRoG4Qng'
    }).addTo(this.mymap);
       
    // add marker to map at Mountain View Public Librarys TODO, remove later
    //let approvedIcon = buildMarkerIcon(approvedMarkerColor);
    //this.marker = L.marker([37.3903, -122.0836], {icon: approvedIcon}).addTo(this.mymap);
    
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
    
    // empty the allRacks featureGroup
    this.allRacks.clearLayers();

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
    
    this.getRacks(userId).done((data) => {
        console.log("data received from db on load:");
        console.log(data);
        
        // filter out the states that have users not equal to our online user ONLY IF
        // the user is currently online
        if (userId) {
            let seen = [];
            const filteredData = data.filter(state => {
    
                /*console.log(state.user_id !== userId);
                console.log(state);*/
                
                if ( state.user_id === userId && (state.vote_type === 1 || state.vote_type === -1)) {
                    seen.push(state.rack_id);
                    return state
                }
                else if (!seen.includes(state.rack_id)) {
                    return state.user_id !== userId
                }
            });
            console.log(filteredData);
            return this.buildRacks(filteredData, userId);
        }
        
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
        // add marker to map
        this.addMarker(marker);
        // set marker element id
        marker._icon.id = states[i].rack_id;
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
       if (layer.options.uniqueId == state.rack_id) {
          
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
        if (state.status === "approved") {
            this.allApproved.addLayer(marker);
        }
        else if (state.status === "not_approved") {
            this.allNotApproved.addLayer(marker);
        }
        
        // bind popup to marker
        marker.bindPopup(content);
    
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

BikeMap.prototype.updateRackStatus = function(rack_id) {
    let params = $.param({rack_id: rack_id}),
        path = {{ url_for('bikes.update_rack_status')|tojson }};
    
    return $.ajax({
        method: 'GET',
        url: path + '?' + params,
        context: this,
        })
}


BikeMap.prototype.vote = function(e) {
    console.log('voting');
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
        if (voteStatus) {
            console.log('rack already has a vote, updating vote');
            // user already submitted a vote for this rack
            let voteType = voteStatus.vote_type,
                newVote = e.target.dataset.votetype;
                
            let newVoteType = newVote === "upvote"? 1: -1;
            
            // if the new vote is different from the old vote, submit the vote (update it)
            if (voteType === 1 && newVoteType === -1 || voteType === -1 && newVoteType === 1) {
                
                this.submitVote(rack_id, user_id, newVoteType).done(vote => {
                    this.updateRackStatus(rack_id).done(status => {
                        
                        this.loadMap(user_id);
                    });
                });
            }
            // if the new vote is the same as the old vote, nothing happens

        }
        else {
            // user is voting for rack for the first time
            console.log('voting for this rack for the first time');
            let voteType = e.target.dataset.votetype;
            voteType = voteType === "upvote"? 1 : -1;
            
            this.submitVote(rack_id, user_id, voteType).done(vote => {
                this.updateRackStatus(rack_id).done(status => {
                    
                    this.loadMap(user_id);
                });
            });
        }
    })

    
    
    
    
};

BikeMap.prototype.arrowHTML = function(state, currentUserId) { 

    let containerId = "rack_" + state.rack_id;
    
    let upvoteArrowClass = "fas fa-arrow-circle-up fa-2x ",
        downvoteArrowClass = "fas fa-arrow-circle-down fa-2x ",
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
    if (state.user_id === currentUserId) {
        if (state.vote_type === undefined) {
            upvoteArrowClass += "arrowHover arrowClick";
            downvoteArrowClass += "arrowHover arrowClick";
        }
        else if (state.vote_type === 1) {
           upvoteArrowClass += "voted";
           downvoteArrowClass += "arrowHover arrowClick";
        }
       else if (state.vote_type === -1) {
            downvoteArrowClass += "voted";
            upvoteArrowClass += "arrowHover arrowClick";
        }
    }
    // if the state's user id does NOT match the current user, then the user has not voted on this rack yet
    else {
        upvoteArrowClass += "arrowHover arrowClick";
        downvoteArrowClass += "arrowHover arrowClick";
    }
    

    return `<div class="arrowsContainer" id=${containerId}>
                     <div><i id=${"u-" + state.rack_id} data-votetype="upvote" class="${upvoteArrowClass}"></i>
                      <span id=${"upvoteCount_" + state.rack_id}>${upvotePercentage}%</span><div>
                      <div><i id=${"d-" + state.rack_id} data-votetype="downvote" class="${downvoteArrowClass}"></i>
                      <span id=${"downvoteCount_" + state.rack_id}>${downvotePercentage}%</span></div>
                      </div>
                     </div> <!-- /#options -->`
};


BikeMap.prototype.popupContent = function(state) {
    let onlineStatus;
    if (this.auth.currentUser) {
        onlineStatus = this.auth.currentUser.uid;
    }
    else {
        onlineStatus = false
    }
    
    /* state : {
     *     address: address (string),
     *     latitude: latitude (string),
     *     longitude: longitude (string),
     *     rack_id: rack_id (string),
     *     status: string (is it a temp marker or not, can be determined based on whether this rack has a status or not),
     *     user_id: user_id (string, empty? (or undefined) if user is not signed in)
    }*/
    if (state.address === null || state.address === undefined) {
        state.address = ""
    }
    let content = `<div id="address">${state.address}</div>
               <div id="coordinates"><span id="lat">${state.latitude}</span> <span>
                 <span id="coordinateComma">,</span>
                 </span> <span id="lng">${state.longitude}</span>
               </div>
               <div id="options">`
    
    // if user is online and this isn't a temporary marker include the submit button and the voting buttons
    if (onlineStatus && state.status) {
        
        let arrows = this.arrowHTML(state, onlineStatus);
        //content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
        content += arrows;
    }
    // if the user is online and this IS a temporary marker include only the submit button
    else if (onlineStatus && !state.status) {
        
        content += `<button id="submitButton" type="submit">Add Bike Rack</button>`
    }
    // if the user is not online then don't include any buttons (doesn't matter if temp marker or not)
    else {
        
        content += `</div> <!-- /#options -->`
    }
    
    return `<div class="popup"> ${content} </div>`
   
};

