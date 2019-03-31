// Function to determine marker size based on population
function markerSize(mag) {
  return mag * 10000;
}

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

// Retrieve CSV data
// d3.csv("data/bfro_reports_geocoded.csv", function(data) {
//   console.log(data);
//   createMap(data);
// });

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log(data);
  createFeatures(data.features);
});



function createFeatures(earthquakeData) {
  // Store our API endpoint inside queryUrl
  var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  //var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  var plateData;


  // Perform a GET request to the query URL
  // d3.json(plateUrl, function(data) {
  //   // Once we get a response, send the data.features object to the createFeatures function
  //   console.log(data);
  //   plateData = data;
  //   createMap(earthquakeData, plateData.features);
  // });

  var link = "http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/" +
    "35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson";
  var link =
    "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  var link =
     "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

  // Grabbing our GeoJSON data..
  d3.json(link, function(data) {
    // Creating a GeoJSON layer with the retrieved data
    //L.geoJson(data).addTo(map);
    console.log("Plates");
    //console.log(data);
    plateData = data;
    console.log(plateData);
    createMap(earthquakeData, plateData);
});

}



function createMap(earthquakeData, plateData) {

  // Define variables for our base layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });
  
  // console.log(data[1228]);

  // var bigfootHeatArray = [];

  // var min_year = 2019;
  // var min_year_index = 10000;
  // for (var i = 0; i < data.length; i++) {
  //   // Loop through the data array, create a new marker,
  //   // and push it to the markers group.
  //   if (data[i].latitude != "")  // location data exists
  //   {
  //     // Add a new marker to the cluster group and bind a pop-up
  //     popupString = "<h1>" + data[i].date + "</h1><br>"
  //       + "(" + data[i].latitude + ", " + data[i].longitude + ")"
  //       + "<br>" + data[i].county + ", " + data[i].state
  //       + "<br>" + data[i].location_details
  //       + "<hr>" + data[i].classification + ": (" + i + ") " + data[i].title
  //       + "<hr>" + data[i].summary
  //       + "<hr>" + data[i].observed;
  //     markers.addLayer(L.marker([data[i].latitude, data[i].longitude])
  //       .bindPopup(
  //         popupString.substring(0, 2348)  // truncate to prevent popup from flashing on and off
  //     ));
  //     // push the location to the heat array
  //     bigfootHeatArray.push([parseFloat(data[i].latitude), parseFloat(data[i].longitude)]);
  //   }
  //   // find first year of data
  //   if (data[i].date != "")
  //   {
  //       var year = data[i].date.substring(0,4);
  //       year = parseInt(year);
  //       // console.log(year);
  //       if (year < min_year)
  //       {
  //         min_year = year;
  //         min_year_index = i;
  //       }
  //   }
  // }
  // console.log("min_year = " + min_year);
  // console.log("min_year_index = " + min_year_index);

  // var bigfootHeat = L.heatLayer(bigfootHeatArray, {
  //   radius: 25,       // radius of each "point" of the heatmap, 25 by default
  //   blur: 15,         // amount of blur, 15 by default
  //   minOpacity: 0.5,  // the minimum opacity the heat will start at
  //   maxZoom: 18,      // zoom level where the points reach maximum intensity
  //   max: 1.0          // maximum point intensity, 1.0 by default
  // });

  // Define arrays to hold created city and state markers
  var quakeMarkers = [];

  for (var i = 0; i < earthquakeData.length; i++) {
    // Setting the marker radius for the state by passing population into the markerSize function
    // Setting the marker radius for the city by passing population into the markerSize function
    var latitude = earthquakeData[i].geometry.coordinates[1];
    var longitude = earthquakeData[i].geometry.coordinates[0];
    var mag = earthquakeData[i].properties.mag;
    var red = Math.floor(255 - 25*mag);
    var green = 0;
    var blue = Math.floor(255 - 25*mag);
    quakeMarkers.push(
      L.circle([latitude, longitude], {
        stroke: false,
        fillOpacity: 0.75,
        color: "purple",
        fillColor: getColor(mag),
        radius: markerSize(earthquakeData[i].properties.mag)
      }).bindPopup("<h3>" + earthquakeData[i].properties.place +
      "</h3><hr><p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    );
  }

  var platePolygons = [];
  console.log(plateData);
  var plateFeatures = plateData.features;
  for (var i = 0; i < plateFeatures.length; i++) {
    // for (var j = 0; j < plateData[i].geometry.coordinates[0].length; j++) {
    //   platePolygons.push(L.polygon([plateData[i].geometry.coordinates[j][0], plateData[i].geometry.coordinates[j][1]]));
    // }
    // json.features.map(function(){
      // if(plateData[i].geometry.type=='MultiPolygon')
      // {
      //   // var polygon = L.multiPolygon(plateData[i].geometry.coordinates.map(function(d){return mapPolygon(d)}), {color: '#f00', weight:'2px'});
      // }
      // else if(plateData[i].geometry.type=='Polygon')
      //   var polygon = L.polygon(mapPolygon(plateData[i].geometry.coordinates), {color: '#f00', weight:'2px'});
      // else if(plateData[i].geometry.type=='LineString')
      //   var polygon = L.mapLineString(mapPolygon(plateData[i].geometry.coordinates), {color: '#f00', weight:'2px'});

      //overlays["Polygon ("+poly.properties.GEN+")"] = polygon;  
      //platePolygons.push(polygon)    
    // })

      var multipolygon = L.polygon(mapPolygon(plateFeatures[i].geometry.coordinates), {color: '#f00', weight:'5px'});
    platePolygons.push(multipolygon);
    
    // This function creates the style definitions for all the layers. Each layer calls this function
    // and is assigned the same style, except for the colour which again is defined dymanically over
            // a function.
          function plateStyle(feature){
              return {
                  //"fillColor": "blue",
                  "weight": 2, //
                  "opacity": 1, //
                  "color": '#ff0', //
                  //"fillOpacity": 0.7 //
              };
          }

    var plateGeoJson = L.geoJson(plateFeatures,{
      style: plateStyle,
      // onEachFeature: function (feature, layer) {
      //     layer.bindPopup(feature.properties.plateName + " " + feature.properties.LAYER);
      // }
    });

  
    //overlays["Original Polygons"]=platePolygons;

    function mapPolygon(poly){
      return poly.map(function(line){return mapLineString(line)})
    }
    function mapLineString(line){
      return line.map(function(d){return [d[1],d[0]]})  
    }

  }


  
  var earthquakes = L.layerGroup(quakeMarkers);
  var plates = L.layerGroup(plateFeatures);

  // var sightingLayer = L.layerGroup(markers);
  // var heatLayer = L.layerGroup(bigfootHeat);

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create an overlay object
  var overlayMaps = {
    "Fault Lines": plateGeoJson,
    "Earthquakes": earthquakes
  };
  
  // Define a map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, plateGeoJson, earthquakes]
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
        // '<li style="background:' + getColor(grades[i] + 1) + '"> </li> ' +
        '<b style="background:' + getColor(magnitudes[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</b> ' +
        //'<div style="width:50px;height:10px;background:' + getColor(grades[i] + 1) + '> </div>' +
        magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
  legend.addTo(myMap);  
}
