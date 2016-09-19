// Error handling; if Google Maps cannot be loaded, append an error message to
// the page
$(window).load(function() {
   if (map == undefined) {
     $("#map").append("<p>Google Maps could not be loaded. Please try again.</p>");
   }
 });
