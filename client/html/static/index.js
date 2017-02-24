var map;
var locateMeControl;
var locationMarker;
var mapMarkers = {};

/**
 * Click on add button in dialog creates the marker and sends it to the server.
 * Also closes the dialog
 */
function addMarker() {
    var marker = document.getElementById('markerDetailsDialogOverlay').marker;
    $.ajax({
        url: '/api/maps', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify(marker)
    }).done(function(insertedMarkerId) {
        marker._id = insertedMarkerId;
        addMarkerToMap(marker);
        closeMarkerDetailsDialog();
    });
}

/**
 * Click on the cross in the dialog closes the dialog
 */
function closeMarkerDetailsDialog() {
    document.getElementById('markerDetailsDialogOverlay').classList.remove('visible', 'new');
}

/**
 * Deletes a marker and removes it from the map
 */
function deleteMarker() {
    var marker = document.getElementById('markerDetailsDialogOverlay').marker;
    var mapMarker = mapMarkers[marker._id];
    $.ajax({
        url: '/api/maps/' + marker._id, 
        type: 'DELETE'
    }).done(function() {
        delete mapMarkers[marker._id];
        mapMarker.setMap(null);
        mapMarker = null;
        closeMarkerDetailsDialog();
    });
}

/**
 * Load the map on window load
 */
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

/**
 * Loads markers for the visible map region
 */
function loadMarkers() {
    var bounds = map.getBounds().toJSON();
    $.get('/api/maps/' + bounds.south + '/' + bounds.north + '/' + bounds.west + '/' + bounds.east, function(markers) {
        Object.keys(mapMarkers).forEach(function(id) {
            var mapMarker = mapMarkers[id];
            mapMarkers[id].setMap(null);
            mapMarker = null;
            delete mapMarkers[id];
        });
        markers.forEach(addMarkerToMap);
    });
}

/**
 * Event handler for clicking the Locate-Me-Button
 */
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

/**
 * Click on the map opens dialog to add marker
 */
function mapClick(evt) {
    var dialog = document.getElementById('markerDetailsDialogOverlay');
    dialog.marker = { lat: evt.latLng.lat(), lng: evt.latLng.lng() }; // temporarily store new marker details
    dialog.classList.add('visible', 'new');
}

/**
 * Add a marker to the map and attach an event handler
 */
function addMarkerToMap(marker) {
    var mapMarker = new google.maps.Marker({
        position: new google.maps.LatLng(marker.lat, marker.lng),
        map: map,
        draggable: false,
        marker: marker
    });
    mapMarker.addListener('click', function(e) {
        var dialog = document.getElementById('markerDetailsDialogOverlay');
        dialog.marker = mapMarker.marker;
        dialog.classList.add('visible');
    });
    mapMarkers[marker._id] = mapMarker;
}

/**
 * Re-position the icon of the current location of the user
 */
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

window.addEventListener('load', function() {
    $.get('/api/maps/apikey', function(apikey) {
        var s = document.createElement('script');
        s.src = 'https://maps.googleapis.com/maps/api/js?key=' + apikey + '&callback=initMap';
        document.body.appendChild(s);
    });
});
