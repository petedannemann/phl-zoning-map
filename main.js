// Feature service url
const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_BaseDistricts/FeatureServer/0';

// Create the feature layer and add it to the map
let zoningOverlays = L.esri.featureLayer({
    url: url,
    onEachFeature: onEachFeature
});

// Add descriptive popups
zoningOverlays.bindPopup((layer) => {
    return L.Util.template(`<h4><b>Code: {CODE}</b></h4><hr>
                            <b>Zoning Group</b>: {ZONINGGROUP}<br>
                            <b>Base District</b>: {LONG_CODE}<br>
                            <b>Pending</b>: {PENDING}<br>
                            <b>Pending Bill</b>: <a href={PENDINGBILLURL}>{PENDINGBILL}</a>`, 
                            layer.feature.properties);
});

// Setup mapbox for basemaps
let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

// Create the basemaps
let grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
    streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

// Set up the map
const map = L.map('map', {
    center: [39.9526, -75.1652],
    zoom: 13,
    layers: [streets, zoningOverlays]
});

// Create a baselayer for the basemaps
let baseLayers = {
    "Streets": streets,
    "Grayscale": grayscale
};

// Create an overlay for the zoning overlay
let overlays = {
    "Zoning Overlay": zoningOverlays
};

// Add the layers to the map
L.control.layers(baseLayers, overlays).addTo(map);

// Add ArcGIS Online Geocoding for searching
const arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

// Add searching by address and feature layer
const searchControl = L.esri.Geocoding.geosearch({
    providers: [
    arcgisOnline,
    L.esri.Geocoding.featureLayerProvider({
        url: url,
        searchFields: ['CODE', 'ZONINGROUP', 'LONG_CODE'],
        bufferRadius: 5000,
        formatSuggestion: function(feature){
        return feature.properties.CODE + ' - ' + feature.properties.ZONINGROUP + ' - ' + feature.properties.LONG_CODE;
        }
    })
    ]
}).addTo(map);

// Create a legend
let legend = L.control({position: 'bottomright'});

// Get the legend values and colors from the feature service
let legendValues = getLegendValues(url);

// Create the legend items
legend.onAdd = function(map) {

    let div = L.DomUtil.create('div', 'info legend');

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < legendValues.length; i++) {
        div.innerHTML +=
            '<i style="background:blue' + '"></i> ' +
            legendValues[i] + '<br>';
    }
    return div;
};

// Add the legend to the map
legend.addTo(map);

// Highlight features when they are hovered with a mouse
function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Reset the highlighting on mouseout
function resetHighlight(e) {
    zoningOverlays.resetStyle(e.target);
}

// Zoom the a feature when its clicked
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Use the onEachFeature option to add the listeners on zoningOverlays
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Get the legend values and colors from the feature service
function getLegendValues(url) {
    // Get the json formatted url
    const jsonUrl = url + '?f=json';
    
    // Store legend values and colors in an object
    let legendValues = [];

    // Make a request to the feature service and get each unique color and value from the legend
    xhttp = new XMLHttpRequest;
    xhttp.responseType = 'json';
    xhttp.open('GET', jsonUrl);
    xhttp.onload  = function() {
        let jsonResponse = xhttp.response;
        jsonResponse.drawingInfo.renderer.uniqueValueInfos.forEach(legendValue => {
            value = legendValue.value;
            legendValues.push(value);
        })
     };
    xhttp.send();

    return legendValues;
}