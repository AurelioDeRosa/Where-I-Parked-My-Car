function checkRequirements()
{
   if (navigator.network.connection.type == Connection.NONE)
   {
      navigator.notification.alert(
         'To use this app you must enable your internet connection',
         function(){},
         'Warning'
      );
      return false;
   }

   return true;
}

function updateIcons()
{
   if ($(window).width() > 480)
   {
      $('a[data-icon], button[data-icon]').each(
         function()
         {
            $(this).removeAttr('data-iconpos');
         }
      );
   }
   else
   {
      $('a[data-icon], button[data-icon]').each(
         function()
         {
            $(this).attr('data-iconpos', 'notext');
         }
      );
   }
}

function urlParam(name)
{
   var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
   if (results != null && typeof results[1] !== 'undefined')
      return results[1];
   else
      return null;
}

/**
 * Initialize the application
 */
function initApplication()
{
   $('#set-car-position, #find-car').click(function() {
      if (checkRequirements() === false)
      {
         $(this).removeClass('ui-btn-active');
         return false;
      }
   });
   $(document).on('pagebeforecreate orientationchange', updateIcons);
   $('#map-page').live(
      'pageshow',
      function()
      {
         var requestType = urlParam('requestType');
         var positionIndex = urlParam('index');
         var geolocationOptions = {
            timeout: 15 * 1000, // 15 seconds
            maximumAge: 10 * 1000, // 10 seconds
            enableHighAccuracy: true
         };
         var position = new Position();

         $.mobile.loading('show');
         // If the parameter requestType is 'set', the user wants to set
         // his car position else he want to retrieve the position
         if (requestType == 'set')
         {
            navigator.geolocation.getCurrentPosition(
               function(location)
               {
                  // Save the position in the history log
                  position.savePosition(
                     new Coords(
                        location.coords.latitude,
                        location.coords.longitude,
                        location.coords.accuracy
                     )
                  );
                  // Update the saved position to set the address name
                  Map.requestLocation(location);
                  Map.displayMap(location, null);
                  navigator.notification.alert(
                     'Your position has been saved',
                     function(){},
                     'Info'
                  );
               },
               function(error)
               {
                  navigator.notification.alert(
                     'Unable to retrieve your position. Is your GPS enabled?',
                     function(){
                        alert("Unable to retrieve the position: " + error.message);
                     },
                     'Error'
                  );
                  $.mobile.changePage('index.html');
               },
               geolocationOptions
            );
         }
         else
         {
            if (position.getPositions().length == 0)
            {
               navigator.notification.alert(
                  'You have not set a position',
                  function(){},
                  'Error'
               );
               $.mobile.changePage('index.html');
               return false;
            }
            else
            {
               navigator.geolocation.watchPosition(
                  function(location)
                  {
                     // If positionIndex parameter isn't set, the user wants to retrieve
                     // the last saved position. Otherwise he accessed the map page
                     // from the history page, so he wants to see an old position
                     if (positionIndex == undefined)
                        Map.displayMap(location, position.getPositions()[0]);
                     else
                        Map.displayMap(location, position.getPositions()[positionIndex]);
                  },
                  function(error)
                  {
                     console.log("Unable to retrieve the position: " + error.message);
                  },
                  geolocationOptions
               );
            }
         }
      }
   );
   $('#positions-page').live(
      'pageinit',
      function()
      {
         createPositionsHistoryList('positions-list', (new Position()).getPositions());
      }
   );
}

/**
 * Create the positions' history list
 */
function createPositionsHistoryList(idElement, positions)
{
   if (positions == null || positions.length == 0)
      return;

   $('#' + idElement).empty();
   var $listElement, $linkElement, dateTime;
   for(var i = 0; i < positions.length; i++)
   {
      $listElement = $('<li>');
      $linkElement = $('<a>');
      $linkElement
      .attr('href', '#')
      .click(
         function()
         {
            if (checkRequirements() === false)
               return false;

            $.mobile.changePage(
               'map.html',
               {
                  data: {
                     requestType: 'get',
                     index: $(this).closest('li').index()
                  }
               }
            );
         }
      );

      if (positions[i].address == '' || positions[i].address == null)
         $linkElement.text('Address not found');
      else
         $linkElement.text(positions[i].address);

      dateTime = new Date(positions[i].datetime);
      $linkElement.text(
         $linkElement.text() + ' @ ' +
         dateTime.toLocaleDateString() + ' ' +
         dateTime.toLocaleTimeString()
      );

      // Append the link to the <li> element
      $listElement.append($linkElement);

      $linkElement = $('<a>');
      $linkElement.attr('href', '#')
      .text('Delete')
      .click(
         function()
         {
            var position = new Position();
            var oldLenght = position.getPositions().length;
            var $parentUl = $(this).closest('ul');

            position.deletePosition($(this).closest('li').index());
            if (oldLenght == position.getPositions().length + 1)
            {
               $(this).closest('li').remove();
               $parentUl.listview('refresh');
            }
            else
            {
               navigator.notification.alert(
                  'Position not deleted. Something gone wrong so please try again.',
                  function(){},
                  'Error'
               );
            }

         }
      );
      // Append the link to the <li> element
      $listElement.append($linkElement);

      // Append the <li> element to the <ul> element
      $('#' + idElement).append($listElement);
   }
   $('#' + idElement).listview('refresh');
}