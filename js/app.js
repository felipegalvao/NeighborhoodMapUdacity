// Definition of the places to be shown in the application
var places_rio = [
  {
    id: 0,
    name: 'Sambadrome Marquês de Sapucaí',
    description: 'Description Sambodromo',
    latLong: {lat: -22.9086949, lng: -43.1958442},
    item_visible: true
  },
  {
    id: 1,
    name: 'Candelária Church',
    description: 'Description Candelaria',
    latLong: {lat: -22.901173, lng: -43.177745},
    item_visible: true
  },
  {
    id: 2,
    name: 'Mosteiro de São Bento (Rio de Janeiro)',
    description: 'Description Mosteiro de Sao Bento',
    latLong: {lat: -22.896968, lng: -43.178132},
    item_visible: true
  },
  {
    id: 3,
    name: 'Museum of Tomorrow',
    description: 'Description Museu do Amanha',
    latLong: {lat: -22.894124, lng: -43.179504},
    item_visible: true
  },
  {
    id: 4,
    name: 'Museum of Modern Art, Rio de Janeiro',
    description: 'Description MAM',
    latLong: {lat: -22.913523, lng: -43.171617},
    item_visible: true
  },
  {
    id: 5,
    name: 'Marina da Glória',
    description: 'Description Marina da Gloria',
    latLong: {lat: -22.920396, lng: -43.170245},
    item_visible: true
  }
]

// Definition of global variables for markers and for the map
var markers = [];
var map;

// Function for creating the map when the page is loaded, based on the places
// list previously created
function initMap() {
  // Definition of the center initial point, which is always the same
  var myLatLng = {lat: -22.9086949, lng: -43.1958442};

  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    scrollwheel: false,
    zoom: 14
  });

  // For each place in the list
  places_rio.forEach(function(placeItem, i){
    // Set the string to be used in the InfoWindow
    var content_str = '';
    content_str += '<h5>' + placeItem.name + '</h5><div id="div-placedescription-id' + placeItem.id + '"></div>';

    // Create the InfoWindow using the string
    var infowindow = new google.maps.InfoWindow({
      content: content_str
    });

    // Create the marker
    var marker = new google.maps.Marker({
      id:i,
      map: map,
      position: placeItem.latLong,
      animation: google.maps.Animation.DROP,
      title: placeItem.name
    });

    // Add event listener for the marker, so that when the marker is clicked
    // a brief description is retrieved from Wikipedia using AJAX, the
    // InfoWindow is shown and the information is updated on the InfoWindow.
    // The event listener also animates the marker.
    marker.addListener('click', function() {
      getDetailsFromWikipedia(placeItem.name, placeItem.id);
      infowindow.open(map, marker);
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });

    // Add marker to the markers global list
    markers.push(marker);
  })
}

// Function for updating the map based on a list of filtered places
function updateMap(filtered_places) {
  // Clear the markers on the map
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = []
  // For each item on the filtered places list
  filtered_places.forEach(function(placeItem, i){
    // Set the string to be used in the InfoWindow
    var content_url = '';
    content_url += '<h5>' + placeItem.name() + '</h5><div id="div-placedescription-id' + placeItem.id() + '"></div>';

    // Create the InfoWindow
    var infowindow = new google.maps.InfoWindow({
      content: content_url
    });

    // Create the marker
    var marker = new google.maps.Marker({
      id:i,
      map: map,
      position: placeItem.latLong(),
      animation: google.maps.Animation.DROP,
      title: placeItem.name()
    });

    // Add event listener for the marker, so that when the marker is clicked
    // a brief description is retrieved from Wikipedia using AJAX, the
    // InfoWindow is shown and the information is updated on the InfoWindow.
    // The event listener also animates the marker.
    marker.addListener('click', function() {
      getDetailsFromWikipedia(placeItem.name(), placeItem.id());
      infowindow.open(map, marker);
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });

    // Add marker to the markers global list
    markers.push(marker);
  })
}

// Set the InfoWindow description with information retrieved from Wikipedia
// using an AJAX call
function getDetailsFromWikipedia(item_title, item_id) {
  // Define the Wikipedia link for the API
  var wikipedia_url = "https://en.wikipedia.org/w/api.php?action=query&titles=" + item_title + "&prop=info%7Cextracts&format=json&inprop=url%7Cdisplaytitle&exchars=500";
  var elem_url = "#div-placedescription-id" + item_id;

  // Ajax function for retrieving details about the place
  var jqxhr = $.ajax({
    url: wikipedia_url,
    dataType: "jsonp",
  })
    // If the AJAX call is successful get the info and set it in the InfoWindow
    .done(function(response) {
      wiki_pages = response.query.pages;
      $.each(wiki_pages, function(i, item) {
        $(elem_url).html(item.extract + '<p><a href="' + item.fullurl + '" target="_blank">Info extracted from Wikipedia. Click here to see more.</a></p>');
      });
    })
    // If the AJAX call is not succesful, set an error message in the InfoWindow
    .fail(function() {
      $(elem_url).html('<p>Could not load information from Wikipedia.');
    });
}

var ViewModel = function() {
  var self = this;

  // Create an observable array for the places
  this.places_to_show = ko.observableArray([]);

  // Add the places to the observable array
  places_rio.forEach(function(placeItem){
    self.places_to_show.push(new Place(placeItem));
  })

  // Show InfoWindow and animate marker if an item from the list is clicked
  self.showInfoWindow = function(placeItem) {
    myid = placeItem.id();
    google.maps.event.trigger(markers[myid], 'click');
  }

  // Filter the places list and markers on map
  self.filterPlaces = function() {
    // Get the value from the input field
    filter_string = $('#text-filter').val();
    var filtered_places = [];
    // If nothing is in the input field, clear the filter
    if (filter_string == "") {
      self.clearFilter();
    // If input field is not empty, filter the places
    } else {
      // For each item
      self.places_to_show().forEach(function(placeItem){
        var place_name = placeItem.name();
        // Check if the inputed string is present in the place name
        var filtered = place_name.indexOf(filter_string);
        // If it is not present, set the visible property to false
        if (filtered == -1) {
          placeItem.item_visible(false);
        // If it is present, add the item to the filtered_places list
        } else {
          filtered_places.push(placeItem);
        };
      });
      // Call update map function with the filtered list of places
      updateMap(filtered_places);
    }
  }

  // Clear the filter on the list and on the map
  self.clearFilter = function() {
    var filtered_places = [];
    self.places_to_show().forEach(function(placeItem){
      placeItem.item_visible(true);
      filtered_places.push(placeItem);
    });
    updateMap(filtered_places);
  }
}

// Definition of a place
var Place = function(data) {
  this.id = ko.observable(data.id);
  this.name = ko.observable(data.name);
  this.description = ko.observable(data.description);
  this.latLong = ko.observable(data.latLong);
  this.item_visible = ko.observable(data.item_visible);
}

ko.applyBindings(new ViewModel());
