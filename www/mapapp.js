
$('#page-map').live("pageinit", function() {
     
    function fadingMsg (locMsg) {
        $("<div class='ui-overlay-shadow ui-body-e ui-corner-all mds-popup-center' id='fadingmsg'>" + locMsg + "</div>")
        .css({ 'display': 'block', 'opacity': '0.9', 'z-index' : '9999999' })
        .appendTo( $.mobile.pageContainer )
        .delay( 2400 )
        .fadeOut( 1200, function(){
            $(this).remove();
        });
    }                

    $('<div class="ui-overlay-shadow ui-body-e ui-corner-all mds-popup" id="intro">' +
            '<h1 style="color:#326f9a;"></h1><h4>Saving Locations</h4><ul>' +
            '<li>Tap map to add marker.</li>' +
            '<li>Tap <img src="images/markers/gimage.png" width="10" height="17"> for current location.</li>' +
            '<li>Tap <img src="images/markers/list18h.png" width="15" height="17"> <strong>Markers</strong> to view<br/> marker list and instructions.</li></ul>' +
            'Attempting to find current location..' +
            '<h1 style="color:#777;">&#40;Tap to dismiss&#41;</h1></div>')
        .css({ 'display': 'block', 'opacity': '0.9', 'z-index' : '9999999' })
        .click( function() {
            $(this).remove();
            return false;
        })
        .appendTo( $.mobile.pageContainer );
    
    // Define a default location and create the map
    
    var defaultLoc = new google.maps.LatLng(32.7153,-117.1564);
    $('#map_canvas').gmap( { 'center': defaultLoc, 'zoom' : 16, 'zoomControlOptions': {'position':google.maps.ControlPosition.LEFT_TOP} })
    .bind('init', function(evt, map) {
        // Try to get current location to center on, else stay at defaultLoc
        $('#map_canvas').gmap('getCurrentPosition', function(pos, status) {
            if (status === "OK") {
                var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                $('#map_canvas').gmap('option', 'center', latLng);
            } else {
                fadingMsg ("<span style='color:#f33;'>Waiting for location</span>");
            }                    
        }, { timeout: 6000, enableHighAccuracy: true } );

        // Read saved markers from localStorage 
        var rawData, markerArray = [], length = localStorage.length, i;
        var markerCount = 0;
        for (i = 0 ; i < length ; i++) {
            var key = localStorage.key(i);
            if (key.indexOf("marker") === 0) {
                markerCount++;
                rawData = localStorage.getItem(localStorage.key(i));
                // Data parsed here as it was stringified before saving
                markerArray[i] = JSON.parse(rawData);
            }
        }
        // Remove all 'old' markers from localStorage
        localStorage.clear();
        // ATTN: Remove items individually if app saves other data!
        
        // Add markers with new markerID to map and localStorage
        for (i = 0 ; i < markerCount ; i++) {                
            addNewMarker(
                    new google.maps.LatLng(markerArray[i].latitude, markerArray[i].longitude), 
                    'blue', markerArray[i]);              
        }
        
        $('#map_canvas').gmap('addControl', 'controls', google.maps.ControlPosition.BOTTOM_CENTER);
        document.getElementById('controls').style.display = 'inline';
            
        // attach map click handler and marker event handlers
        $(map).click( function(event) {
            $('#map_canvas').gmap('option', 'center', event.latLng);
            addNewMarker( event.latLng, 'blue', null);
        });
                        
        $('#current_pos_marker').click( function() {
            $('#mask').css({'width':screen.width,'height':screen.height});
            $('#mask').fadeTo("slow",0.6);

            fadingMsg ("Using device geolocation service to find location.");
                
            // See extension defined in jquery.mobile/jquery.ui.map.extensions.js
            $('#map_canvas').gmap('getCurrentPosition', function(pos, status) {
                if (status === "OK") {
                    var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    $('#map_canvas').gmap('option', 'center', latLng);
                    $('#fadingmsg').remove();
                    addNewMarker( latLng, 'green', null );                    
                } else {
                    fadingMsg ("<span style='color:#f33;'>Error</span> while getting current location. Not supported in browser or GPS/location disabled.");
                    $('#mask').hide();                        
                }    
                $('#current_pos_marker').removeClass("ui-btn-active");
            }, { timeout: 6000, enableHighAccuracy: true } );
        });           
    }); // end .bind
        
    // Create blue, green and shadow images for custom markers
    var bimage = new google.maps.MarkerImage(
            'images/markers/bimage.png',
            new google.maps.Size(20,34),
            new google.maps.Point(0,0),
            new google.maps.Point(10,34)
    );

    var gimage = new google.maps.MarkerImage(
            'images/markers/gimage.png',
            new google.maps.Size(20,34),
            new google.maps.Point(0,0),
            new google.maps.Point(10,34)
    );

    var shadow = new google.maps.MarkerImage(
            'images/markers/shadow.png',
            new google.maps.Size(40,34),
            new google.maps.Point(0,0),
            new google.maps.Point(10,34)    
    );

    function addNewMarker ( latLng, mrkr, savedMarker ) {
        var markerId;
        var mrkrIcon = (mrkr === 'blue') ? bimage : gimage;
        $('#map_canvas').gmap('addMarker', {'position': latLng, 'icon': mrkrIcon, 'shadow' : shadow,
            'shape' : {'type': 'poly', 'coords' : [13,0,15,1,16,2,17,3,18,4,18,5,19,6,19,7,19,8,19,9,19,10,19,11,19,12,19,13,18,14,18,15,17,16,16,17,15,
                                                   18,14,19,14,20,13,21,13,22,12,23,12,24,12,25,12,26,11,27,11,28,11,29,11,30,11,31,11,32,11,33,8,33,8,32,8,31,
                                                   8,30,8,29,8,28,8,27,8,26,7,25,7,24,7,23,6,22,6,21,5,20,5,19,4,18,3,17,2,16,1,15,1,14,0,13,0,12,0,11,0,10,0,9,
                                                   0,8,0,7,0,6,1,5,1,4,2,3,3,2,4,1,6,0,13,0]},
             'draggable': true, 'bound': false,
             'labelAnchor': new google.maps.Point(44, 0), 'labelClass': 'marker-labels', 'labelStyle': {opacity: 0.75}, 'labelVisible': true, 
             'marker' : MarkerWithLabel},
             function(map, marker) {
                 markerId = marker.__gm_id;

                 if (savedMarker === null) {
                   $('#markerdiv').append('<div class="mclass' + markerId + '" style="display:none;"> <form onsubmit="return false;" method="get" action="/">'                               
                   + '<div data-role="fieldcontain"><label for="tag' + markerId + '">Marker Title<br/></label><input type="text" size="24" maxlength="30" name="tag' + markerId + '" id="tag' + markerId + '" value="" /></div>'
                   + '<div data-role="fieldcontain"><label for="address' + markerId + '">Address<br/></label><input type="text" size="24" maxlength="30" name="address' + markerId + '" id="address' + markerId + '" value="" /></div>'
                   + '<div data-role="fieldcontain"><label for="state' + markerId + '">City, State<br/></label><input type="text" size="24" maxlength="30" name="state' + markerId + '" id="state' + markerId + '" value="" /></div>'
                   + '<div data-role="fieldcontain"><label for="country' + markerId + '">Country<br/></label><input type="text" size="24" maxlength="30" name="country' + markerId + '" id="country' + markerId + '" value="" /></div>'
                   + '<div data-role="fieldcontain"><label for="comment' + markerId + '">Comment<br/></label><textarea maxlength="64" cols=24 rows=3 name="comment' + markerId + '" id="comment' + markerId + '" value="" /></textarea></div>'                              
                   + '</form></div>');
                   getGeoData(marker);
                 } else {
                     localStorage.setItem("marker" + markerId, JSON.stringify(savedMarker));
                     
                     // Add marker saved in localStorage, already have geocoding data
                     $('#markerdiv').append('<div class="mclass' + markerId + '" style="display:none;"> <form onsubmit="return false;" method="get" action="/">'                               
                             + '<div data-role="fieldcontain"><label for="tag' + markerId + '">Marker Title<br/></label><input type="text" size="24" maxlength="30" name="tag' + markerId + '" id="tag' + markerId + '" value="' + savedMarker.id + '" /></div>'
                             + '<div data-role="fieldcontain"><label for="address' + markerId + '">Address<br/></label><input type="text" size="24" maxlength="30" name="address' + markerId + '" id="address' + markerId + '" value="' + savedMarker.address + '" /></div>'
                             + '<div data-role="fieldcontain"><label for="state' + markerId + '">City, State<br/></label><input type="text" size="24" maxlength="30" name="state' + markerId + '" id="state' + markerId + '" value="' + savedMarker.state + '" /></div>'
                             + '<div data-role="fieldcontain"><label for="country' + markerId + '">Country<br/></label><input type="text" size="24" maxlength="30" name="country' + markerId + '" id="country' + markerId + '" value="' + savedMarker.country + '" /></div>'
                             + '<div data-role="fieldcontain"><label for="comment' + markerId + '">Comment<br/></label><textarea maxlength="64" cols=24 rows=3 name="comment' + markerId + '" id="comment' + markerId + '" value="' + savedMarker.comment + '" /></textarea></div>'                              
                             + '</form></div>');

                     $('#li-placeholder').css('display', 'none');
                     // Put marker info in ul#marker-list on page-marker 
                     $('<li id="item' + markerId + '"><a href="#page-map"><h4>' 
                             + ((savedMarker.id !== "") ? savedMarker.id : ('Marker ID ' + markerId)) 
                             + '</h4><p>' + savedMarker.address + '<br/>' 
                             + savedMarker.state + '  ' 
                             + savedMarker.country  
                             + '<br/>' + marker.getPosition() + '<br/>'
                             + savedMarker.comment
                             + '</p></a><a href="#page-map" id="edit' + markerId + '">Edit</a></li>').appendTo('ul#marker-list');

                     // Bind click handler: center map on the selected marker or open dialog to edit
                     $('li#item' + markerId).click( function() {
                         $('#map_canvas').gmap('option', 'center', marker.getPosition());
                         marker.setAnimation(google.maps.Animation.DROP);
                     });
                     $('#edit' + markerId).click( function() {
                        $('#map_canvas').gmap('option', 'center', marker.getPosition());
                        openMarkerDialog(marker);
                     });

                     marker.set('labelContent',
                             (($('#tag' + markerId).val() !== "") ? $('#tag' + markerId).val() : ('Marker ' + markerId)));

                     try {
                         $("ul#marker-list").listview('refresh');
                     } catch(e) { }                                      
                 }
             })
             .dragend( function() {
                 // Marker == this - already has new position in it
                 getGeoData(this);
             }).click( function() {
                 // Existing marker was clicked, location did not change
                 openMarkerDialog(this);
             });                        
        return markerId;
    }
        
    function getGeoData (marker) {
        // Make Reverse Geocoding request (latlng to address)
        // Note: 'region' option not used here, include for region code biasing
        $('#map_canvas').gmap('search', { 'location': marker.getPosition() }, function(results, status) {
            if ( status === 'OK' ) {
                // Regions other than US may need to use address_components to get address etc
                //$.each(results[0].address_components, function(i,v) {
                //    if ( v.types[0] === "administrative_area_level_1" || v.types[0] === "administrative_area_level_2" ) {
                //        city and/or state
                //        $('#state' + marker.__gm_id).val(v.long_name);
                //    } else if ( v.types[0] === "country") {
                //        $('#country' + marker.__gm_id).val(v.long_name);
                //    }
                //});
                var addr = results[0].formatted_address.split(', ', 4);
                //alert('[' + addr[0] + '] [' + addr[1] + '] [' + addr[2] + '] [' + addr[3] + ']');                         
                $('#address' + marker.__gm_id).val(addr[0]);
                $('#state' + marker.__gm_id).val(addr[1] + ", " + addr[2]);
                $('#country' + marker.__gm_id).val(addr[3]);
                openMarkerDialog(marker);
            } else {
                fadingMsg('Unable to get GeoSearch data.');
                openMarkerDialog(marker);
            }
        }); 
    }
                
    function openMarkerDialog(marker) {
        var markerId = marker.__gm_id;
        var lastAddress = $('#address' + markerId).val(), lastCityState = $('#state' + markerId).val(), 
        lastCountry = $('#country' + markerId).val();
        
        $('#mask').css({'width':screen.width,'height':screen.height});
        $('#mask').fadeTo("slow",0.6);  
            
        // Remove this marker and placeholder from ul#marker-list
        $('li#item' + markerId).remove();
        $('#li-placeholder').css('display', 'none');
                           
        $("<div class='ui-overlay ui-overlay-shadow ui-body-e ui-corner-all mds-editsave' id='dialog" + markerId + "'></div>")
         .css({ 'display': 'block', 'opacity': '0.9', 'z-index' : '9999999' })
        .append('<h4 style="margin:0.2em;">Edit &amp; Save Marker</h4>')
        .append( $('div.mclass'+markerId).css({ 'display': 'block'})
                .append('<div data-inline="true" id="dialog-btns" ><a id="remove" class="mbtn" style="font-size:15px">Remove</a>' +
                        '<a id="save" class="mbtn">&nbsp;&nbsp;&nbsp;Save&nbsp;&nbsp;&nbsp;</a></div>') )
                        .appendTo( $.mobile.pageContainer );
                        
        $('#remove').click( function () {
            // If list is empty, show placeholder text again
            if ($('ul#marker-list').find('li').length === 2) {
                $('#li-placeholder').css('display', 'block'); 
            }
                
            // remove marker from map
            marker.setMap(null);                            
            // Remove entire dialog, including div mclass{id} (the marker data)
            $('#dialog' + markerId).remove();
            $('#mask').hide();

            localStorage.removeItem("marker" + markerId);
        });

        $('#save').click( function () {
            marker.set('labelContent', 
                    (($('#tag' + markerId).val() !== "") ? $('#tag' + markerId).val() : ('Marker ' + markerId)));
                
            // Remove Save and Remove buttons
            $('#dialog-btns').remove();
                        
            // Store the div mclass{id} in markerdiv
            $('.mclass' + markerId)
            .css({ 'display': 'none'})
            .appendTo('#markerdiv');

            // Test if user changed any part of marker address
            if ( (lastAddress !== $('#address' + markerId).val()) ||
                    (lastCityState !== $('#state' + markerId).val()) ||
                    (lastCountry !== $('#country' + markerId).val()) ) {
                    
                // Make Geocoding requestion (commas-separated address to lat/lng)
                $('#map_canvas').gmap('search', { 'address': $('#address' + markerId).val() + ', ' +
                    $('#state' + markerId).val() + ', ' + $('#country' + markerId).val() }, 
                    function(results, status) {
                        if ( status === 'OK' ) {
                            marker.setPosition(results[0].geometry.location);
                            $('#map_canvas').gmap('option', 'center', results[0].geometry.location);
                        } else {
                            fadingMsg('Unable to get GeoSearch data. Marker remains in same place.');
                        }
                    });                
            }
                
            // Put marker info in ul#marker-list on page-marker 
            $('<li id="item' + markerId + '"><a href="#page-map"><h4>' +
                    (($('#tag' + markerId).val() !== "") ? $('#tag' + markerId).val() : ('Marker ' + markerId)) +
                    '</h4><p>' + $('#address' + markerId).val() + '<br/>' +
                    $('#state' + markerId).val() + '  ' +
                    $('#country' + markerId).val() +
                    '<br/>' + marker.getPosition() + '<br/>' +
                    $('#comment'+ markerId).val() +
                    '</p></a><a href="#page-map" data-direction="reverse" id="edit' + markerId + '">Edit</a></li>').appendTo('ul#marker-list');
                
            // Bind click handler: center map on the selected marker or open dialog to edit
            $('li#item' + markerId).click( function() {
                $('#map_canvas').gmap('option', 'center', marker.getPosition());
                marker.setAnimation(google.maps.Animation.DROP);
            });
            $('#edit' + markerId).click( function() {
                $('#map_canvas').gmap('option', 'center', marker.getPosition());
                $.mobile.changePage($('#page-map'));
                openMarkerDialog(marker);
                return true;
            });
                         
            try {
                $("ul#marker-list").listview('refresh');
            } catch(e) { }   
                
            // Remove the remaining bits of dialog and mask
            $('#dialog' + markerId).remove();
            $('#mask').hide();

            // Put marker data into array and save in localStorage
            var markerData = {};
            markerData.latitude = marker.getPosition().lat().toString();
            markerData.longitude = marker.getPosition().lng().toString();
            markerData.id = $('#tag' + markerId).val();
            markerData.address = $('#address' + markerId).val();
            markerData.state = $('#state' + markerId).val();  
            markerData.country = $('#country' + markerId).val();
            markerData.comment = $('#comment'+ markerId).val();
            
            localStorage.setItem("marker" + markerId, JSON.stringify(markerData));
        });

        $('#mask').click( function() {
            // If user taps mask, save marker data as is by default
            // Alternative: remove by default: $('#remove').trigger('click');
            $('#save').trigger('click');
        });            
    }
});

$('#page-marker').live("pageshow", function() {
    try {
        $("ul#marker-list").listview('refresh');
    } catch(e) { }   
});
