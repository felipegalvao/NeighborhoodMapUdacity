// Definition of the places to be shown in the application
var places_rio = [
  {
    id: 0,
    name: 'Sambadrome Marquês de Sapucaí',
    latLong: {lat: -22.9086949, lng: -43.1958442},
    item_visible: true
  },
  {
    id: 1,
    name: 'Candelária Church',
    latLong: {lat: -22.901173, lng: -43.177745},
    item_visible: true
  },
  {
    id: 2,
    name: 'Mosteiro de São Bento (Rio de Janeiro)',
    latLong: {lat: -22.896968, lng: -43.178132},
    item_visible: true
  },
  {
    id: 3,
    name: 'Museum of Tomorrow',
    latLong: {lat: -22.894124, lng: -43.179504},
    item_visible: true
  },
  {
    id: 4,
    name: 'Museum of Modern Art, Rio de Janeiro',
    latLong: {lat: -22.913523, lng: -43.171617},
    item_visible: true
  },
  {
    id: 5,
    name: 'Marina da Glória',
    latLong: {lat: -22.920396, lng: -43.170245},
    item_visible: true
  }
];

// Definition of global variables for markers, infoWindows and map
var markers = [];
var infoWindows = [];
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
    content_str += '<h5>' + placeItem.name + '</h5><div id="div-placedescription-id' + placeItem.id + '" data-bind="html: current_place().description()"></div>';

    // Create the InfoWindow using the string
    var infowindow = new google.maps.InfoWindow({
      id:i,
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
      // Use the ViewModel to access functions on it
      var create_view_model = new ViewModel();
      create_view_model.getCurrentPlace(create_view_model.places_to_show()[i]);
      create_view_model.getDetailsFromWikipedia();
      infowindow.open(map, marker);
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });

    // Add marker and infoWindow to the markers and infoWindows global lists
    markers.push(marker);
    infoWindows.push(infowindow);
  });
}

// Function for updating the map based on a list of filtered places
function updateMap(filtered_places) {
  // Clear the markers on the map
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  infoWindows = [];
  var update_view_model = new ViewModel();
  // For each item on the filtered places list
  filtered_places.forEach(function(placeItem, i){
    // Set the string to be used in the InfoWindow
    var content_url = '';
    content_url += '<h5>' + placeItem.name() + '</h5><div id="div-placedescription-id' + placeItem.id() + '"></div>';

    // Create the InfoWindow
    var infowindow = new google.maps.InfoWindow({
      id: placeItem.id(),
      content: content_url
    });

    // Create the marker
    var marker = new google.maps.Marker({
      id:placeItem.id(),
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
      update_view_model.getCurrentPlace(update_view_model.places_to_show()[placeItem.id()]);
      update_view_model.getDetailsFromWikipedia();
      infowindow.open(map, marker);
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });

    // Add marker to the markers global list
    markers.push(marker);
    infoWindows.push(infowindow);
  });
}

function googleError() {
  alert("Google Maps could not be loaded.");
}

var ViewModel = function() {
  var self = this;

  // Create an observable array for the places
  this.places_to_show = ko.observableArray([]);

  // Add the places to the observable array
  places_rio.forEach(function(placeItem){
    self.places_to_show.push(new Place(placeItem));
  });

  this.current_place = ko.observable();
  this.current_place = ko.observable(this.places_to_show()[0]);

  // Show InfoWindow and animate marker if an item from the list is clicked
  self.showInfoWindow = function(placeItem) {
    myid = placeItem.id();
    var marker_to_show = 0;
    // Get the correct marker to show and animate
    markers.forEach(function(marker, i) {
      if (marker.id == myid) {
        marker_to_show = i;
      }
    });
    google.maps.event.trigger(markers[marker_to_show], 'click');
  };

  // This observable will be used if Google Maps cannot be loaded
  this.GMapsStatus = ko.observable();

  // Set the current place
  self.getCurrentPlace = function(placeItem) {
    self.current_place(placeItem);
  };

  // Get Details from Wikipedia for a place based on its name
  self.getDetailsFromWikipedia = function() {
    // Define the Wikipedia URL for the API
    var wikipedia_url = "https://en.wikipedia.org/w/api.php?action=query&titles=" + self.current_place().name() + "&prop=info%7Cextracts&format=json&inprop=url%7Cdisplaytitle&exchars=500";

    // Get the correct infoWindow to update
    var infoWindow_to_update = 0;
    infoWindows.forEach(function(infoWindow, i) {
      if (infoWindow.id == self.current_place().id()) {
        infoWindow_to_update = i;
      }
    });

    // Ajax function for retrieving details about the place
    var jqxhr = $.ajax({
      url: wikipedia_url,
      dataType: "jsonp",
    })
      // If the AJAX call is successful get the info and set it in the InfoWindow
      .done(function(response) {
        wiki_pages = response.query.pages;
        $.each(wiki_pages, function(i, item) {
          infoWindows[infoWindow_to_update].setContent('<h5>' + self.current_place().name() + '</h5>' + item.extract + '<p><a href="' + item.fullurl + '" target="_blank">Info extracted from Wikipedia. Click here to see more.</a></p>');
          // self.current_place().description(item.extract + '<p><a href="' + item.fullurl + '" target="_blank">Info extracted from Wikipedia. Click here to see more.</a></p>');
        });
      })
      // If the AJAX call is not succesful, set an error message in the InfoWindow
      .fail(function() {
        infoWindows[infoWindow_to_update].setContent('<h5>' + self.current_place().name() + '</h5><p>Could not load information from Wikipedia.');
      });
  };

  // Call three functions when an item is clicked on the list
  self.onClickPlaceList = function(placeItem) {
    self.getCurrentPlace(placeItem);
    self.showInfoWindow(placeItem);
    self.getDetailsFromWikipedia();
  };

  // Filter the places list and markers on map
  self.filterPlaces = function() {
    // Get the value from the input field
    filter_string = $('#text-filter').val();
    var filtered_places = [];
    // If nothing is in the input field, clear the filter
    if (filter_string === "") {
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
        }
      });
      // Call update map function with the filtered list of places
      updateMap(filtered_places);
    }
  };

  // Clear the filter on the list and on the map
  self.clearFilter = function() {
    var filtered_places = [];
    self.places_to_show().forEach(function(placeItem){
      placeItem.item_visible(true);
      filtered_places.push(placeItem);
    });
    updateMap(filtered_places);
  };

  // Update the Google Maps Status if the map could not be loaded
  self.updateGMapsStatus = function() {
    if (map === undefined) {
      self.GMapsStatus("Could not load Google Maps");
      console.log(self.GMapsStatus());
    }
  };

  // When the page is fully loaded, check if Google Maps was loaded
  $(window).load(function() {
   self.updateGMapsStatus();
  });
};

// Definition of a place
var Place = function(data) {
  this.id = ko.observable(data.id);
  this.name = ko.observable(data.name);
  this.latLong = ko.observable(data.latLong);
  this.item_visible = ko.observable(data.item_visible);
};

ko.applyBindings(new ViewModel());
