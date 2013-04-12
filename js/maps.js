function Map()
{
}

/**
 * Display the map showing the user position or the latter and the car position
 */
Map.displayMap = function(userPosition, carPosition)
{
   var userLatLng = null;
   var carLatLng = null;

   if (userPosition != null)
      userLatLng = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
   if (carPosition != null)
      carLatLng = new google.maps.LatLng(carPosition.position.latitude, carPosition.position.longitude);

   var options = {
      zoom: 20,
      disableDefaultUI: true,
      streetViewControl: true,
      center: userLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   }

   var map = new google.maps.Map(document.getElementById('map'), options);
   var marker = new google.maps.Marker({
      position: userLatLng,
      map: map,
      title: 'Your position'
   });
   // If carLatLng is null means that the function has been called when the
   // user set his current position and that is when he parked the car so the
   // icon will be shown accordingly.
   if (carLatLng == null)
      marker.setIcon('images/car-marker.png');
   else
      marker.setIcon('images/user-marker.png');
   var circle = new google.maps.Circle({
      center: userLatLng,
      radius: userPosition.coords.accuracy,
      map: map,
      fillColor: '#70E7FF',
      fillOpacity: 0.2,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0
   });
   map.fitBounds(circle.getBounds());

   if (carLatLng != null)
   {
      marker = new google.maps.Marker({
         position: carLatLng,
         map: map,
         icon: 'images/car-marker.png',
         title: 'Car position'
      });
      circle = new google.maps.Circle({
         center: carLatLng,
         radius: carPosition.position.accuracy,
         map: map,
         fillColor: '#70E7FF',
         fillOpacity: 0.2,
         strokeColor: '#0000FF',
         strokeOpacity: 1.0
      });

      // Display route to the car
      options = {
         suppressMarkers: true,
         map: map,
         preserveViewport: true
      }
      this.setRoute(new google.maps.DirectionsRenderer(options), userLatLng, carLatLng);
   }

   $.mobile.loading('hide');
}

/**
 * Calculate the route from the user to his car
 */
Map.setRoute = function(directionsDisplay, userLatLng, carLatLng)
{
   var directionsService = new google.maps.DirectionsService();
   var request = {
      origin: userLatLng,
      destination: carLatLng,
      travelMode: google.maps.DirectionsTravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC
   };

   directionsService.route(
      request,
      function(response, status)
      {
         if (status == google.maps.DirectionsStatus.OK)
            directionsDisplay.setDirections(response);
         else
         {
            navigator.notification.alert(
               'Unable to retrieve a route to your car. However, you can still find it by your own.',
               function(){},
               'Warning'
            );
         }
      }
   );
}

/**
 * Request the address of the retrieved location
 */
Map.requestLocation = function(position)
{
   new google.maps.Geocoder().geocode(
      {
         'location': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      },
      function(results, status)
      {
         if (status == google.maps.GeocoderStatus.OK)
         {
            var positions = new Position();
            positions.updatePosition(0, positions.getPositions()[0].coords, results[0].formatted_address);
         }
      }
   );
}