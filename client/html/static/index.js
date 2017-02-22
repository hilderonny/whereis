var map;
var locateMeControl;
var locationMarker;
var mapMarkers = {};

// Re-position the icon of the current location of the user
function updateLocationMarker(position) {
        var googleMapsPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        if (locationMarker) {
            locationMarker.setPosition(googleMapsPos);
        } else {
            locationMarker = new google.maps.Marker({
                position:googleMapsPos,
                map: map,
                icon: 'static/location.png'
            });                    
        }
}

// Event handler for clicking the Locate-Me-Button
function locateMeControlClick() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            updateLocationMarker(position);
            map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
            locateMeControl.classList.add('active');
        }, function() {
            locateMeControl.classList.remove('active');
        });
        navigator.geolocation.watchPosition(updateLocationMarker);
    }
}

// Add a marker to the map and attach an event handler
function addMarker(marker) {
    var mapMarker = new google.maps.Marker({
        position: new google.maps.LatLng(marker.lat, marker.lng),
        map: map,
        draggable: false,
        _id: marker._id
    });
    mapMarker.addListener('click', function(e) {
        deleteMarker(mapMarker);
    });
    mapMarkers[mapMarker._id] = mapMarker;
}

// Deletes a marker
function deleteMarker(marker) {
    $.ajax({
        url: '/api/maps/' + marker._id, 
        type: 'DELETE'
    }).done(function() {
        delete mapMarkers[marker._id];
        marker.setMap(null);
        marker = null;
    });
}

// Loads markers for the visible map region
function loadMarkers() {
    var bounds = map.getBounds().toJSON();
    $.get('/api/maps/' + bounds.south + '/' + bounds.north + '/' + bounds.west + '/' + bounds.east, function(markers) {
        Object.keys(mapMarkers).forEach(function(id) {
            var mapMarker = mapMarkers[id];
            mapMarkers[id].setMap(null);
            mapMarker = null;
            delete mapMarkers[id];
        });
        markers.forEach(addMarker);
    });
}

// Handles clicks on the map and adds marker on the corresponding position
function mapClick(evt) {
    var marker = { lat: evt.latLng.lat(), lng: evt.latLng.lng() };
    $.ajax({
        url: '/api/maps', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify(marker)
    }).done(function(insertedMarkerId) {
        marker._id = insertedMarkerId;
        addMarker(marker);
    });
}

// Load the map on window load
function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 50.977781, lng: 11.323719},
        zoom: 17
    });
    map.addListener('click', mapClick);
    map.addListener('idle', loadMarkers);

    locateMeControl = document.createElement('div');
    locateMeControl.classList.add('locateMeControl');
    locateMeControl.innerHTML = '<div></div>';
    locateMeControl.addEventListener('click', locateMeControlClick);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locateMeControl);

}

window.addEventListener('load', function() {
    $.get('/api/maps/apikey', function(apikey) {
        var s = document.createElement('script');
        s.src = 'https://maps.googleapis.com/maps/api/js?key=' + apikey + '&callback=initMap';
        document.body.appendChild(s);
    });
});
