// Feature service url
const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_BaseDistricts/FeatureServer/0';

// Set up the map
const map = L.map('map', {
    center: [39.9526, -75.1652],
    zoom: 13
});

// Create the feature layer and add it to the map
let zoningOverlays = L.esri.featureLayer({
    url: url,
    simplifyFactor: 0.70, // Simplify the feature to draw it faster
    precision: 5,
    onEachFeature: onEachFeature,
}).addTo(map);

// Store a reference to the selected zoning code
let zoningSelection = document.getElementById('zoning-code');

// Add each zoning code as a select option
addZoningCodeOptions();

// Update the zoningOverlays when an selection is made
zoningSelection.addEventListener('change', () => {
    zoningOverlays.setWhere(zoningSelection.value);
});

// Show Hover to Inspect when the mouse isn't on a feature
zoningOverlays.on('mouseout', (e) => {
    document.getElementById('info-pane').innerHTML = 'Hover to Inspect';
    zoningOverlays.resetFeatureStyle(oldId);
});

// Show the feature's Zoning Code when moused over
zoningOverlays.on('mouseover', (e) => {
    oldId = e.layer.feature.id;
    document.getElementById('info-pane').innerHTML = e.layer.feature.properties.CODE + ' - ' + e.layer.feature.properties.ZONINGGROUP;
    zoningOverlays.setFeatureStyle(e.layer.feature.id, {
        color: '#000000',
        weight: 3,
        opacity: 1
    });
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

// Set up basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add ArcGIS Online Geocoding for searching
const arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

// Add searching by address and feature layer
const searchControl = L.esri.Geocoding.geosearch({
    providers: [
        arcgisOnline,
        L.esri.Geocoding.featureLayerProvider({
            url: url,
            searchFields: ['CODE', 'ZONINGGROUP'],
            bufferRadius: 5000,
            formatSuggestion: function(feature){
            return feature.properties.CODE + ' - ' + feature.properties.ZONINGGROUP;
            }
        })
    ]
}).addTo(map);

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

// Get all unique zoning codes from the feature service
function addZoningCodeOptions() {
    // Get the json formatted url
    const jsonUrl = url + '?f=json';

    // Make a request to the feature service and get each unique color and value from the legend
    fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
        data.drawingInfo.renderer.uniqueValueInfos.forEach(zoningCode => {
            // Create the option element
            let option = document.createElement("option");

            // Populate the option's text and value
            option.text = zoningCode.value; 
            option.value = "CODE='" + zoningCode.value.replace('-', '') + "'"; // Remove the dash to allow for querying

            // Add the option to the selections
            zoningSelection.add(option);
        })
    });
}