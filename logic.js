// Function to determine marker size based on magnitude
function markerSize(mag) {
  return mag * 10000;
}

// Function to determine marker color based on magnitude
function getColor(d) {
  return d > 7 ? '#800026' :
         d > 6  ? '#BD0026' :
         d > 5  ? '#E31A1C' :
         d > 4  ? '#FC4E2A' :
         d > 3   ? '#FD8D3C' :
         d > 2   ? '#FEB24C' :
         d > 1   ? '#FED976' :
                    '#FFEDA0';
}

// Store our API endpoint inside queryUrl
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data);
  createFeatures(data.features);
});



function createFeatures(earthquakeData) {
  // Store our API endpoint for fault lines inside link
  // var link =
  //    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  var link =
     "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  var faultData;

  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {
    // Creating a GeoJSON layer with the retrieved data
    faultData = data;
    console.log(faultData);
    createMap(earthquakeData, faultData);
  });
}



function createMap(earthquakeData, faultData) {

  // Define variables for our base layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Define arrays to hold created quake markers
  var quakeMarkers = [];

  for (var i = 0; i < earthquakeData.length; i++) {
    var latitude = earthquakeData[i].geometry.coordinates[1];
    var longitude = earthquakeData[i].geometry.coordinates[0];
    var mag = earthquakeData[i].properties.mag;
    var fillColor = getColor(mag);
    quakeMarkers.push(
      L.circle([latitude, longitude], {
        stroke: false,
        fillOpacity: 0.75,
        color: fillColor,
        fillColor: fillColor,
        radius: markerSize(mag)
      }).bindPopup("<h3>" + earthquakeData[i].properties.place +
        "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) +
         ", magnitude: " + mag + "</p>")
    );
  }

  var faultPolygons = [];
  var faultFeatures = faultData.features;
  for (var i = 0; i < faultFeatures.length; i++) {

    var multipolygon = L.polygon(mapPolygon(faultFeatures[i].geometry.coordinates), {color: '#f00', weight:'5px'});
    faultPolygons.push(multipolygon);
    
    // This function creates the style definitions for all the layers. Each layer calls this function
    // and is assigned the same style, except for the colour which again is defined dymanically over
    // a function.
          function faultStyle(feature){
              return {
                  "weight": 2,
                  "opacity": 1,
                  "color": '#ff8000',
              };
          }

    var faultGeoJson = L.geoJson(faultFeatures,{
      style: faultStyle
    });

    function mapPolygon(poly){
      return poly.map(function(line){return mapLineString(line)})
    }
    function mapLineString(line){
      return line.map(function(d){return [d[1],d[0]]})  
    }

  }


  
  var earthquakes = L.layerGroup(quakeMarkers);

  // Create a baseMaps object
  var baseMaps = {
    "Streets": streetmap,
    "Light": lightmap,
    "Dark": darkmap,
    "Outdoors": outdoormap,
    "Satellite": satellitemap
  };

  // Create an overlay object
  var overlayMaps = {
    "Fault Lines": faultGeoJson,
    "Earthquakes": earthquakes
  };
  
  // Define a map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, faultGeoJson, earthquakes]
  });

  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [0, 1, 2, 3, 4, 5, 6, 7],
        labels = [];
  
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        '<b style="background:' + getColor(magnitudes[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</b> ' +
          magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
  legend.addTo(myMap);  
}
