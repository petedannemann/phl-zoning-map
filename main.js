initmap();

function initmap() {
    // Feature service url
    const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_BaseDistricts/FeatureServer/0'
    
    // Set up the map
    const map = L.map('map').setView([39.9526, -75.1652], 13);

    // Add ESRI Streets basemap
    L.esri.basemapLayer('Streets')
          .addTo(map);

    // Create the feature layer and add it to the map
    let zoningOverlays = L.esri.featureLayer({
        url: url
    }).addTo(map);

    // Add descriptive popups
    zoningOverlays.bindPopup((layer) => {
        return L.Util.template(`<p><b>Code</b>: {CODE}</p>
                                <p><b>Zoning Group</b>: {ZONINGGROUP}</p>
                                <p><b>Base District</b>: {LONG_CODE}</p>
                                <p><b>Pending</b>: {PENDING}</p>
                                <p><b>Pending Bill</b>: <a href={PENDINGBILLURL}>{PENDINGBILL}</a></p>`, 
                                layer.feature.properties);
    });

    // Add ArcGIS Online Geocoding for searching
    const arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

    // Add searching by address and feature layer
    const searchControl = L.esri.Geocoding.geosearch({
        providers: [
        arcgisOnline,
        L.esri.Geocoding.featureLayerProvider({
            url: url,
            searchFields: ['OVERLAY_NAME', 'OVERLAY_SYMBOL', 'CODE_SECTION'],
            bufferRadius: 5000,
            formatSuggestion: function(feature){
            return feature.properties.OVERLAY_NAME + ' - ' + feature.properties.OVERLAY_SYMBOL + ' - ' + feature.properties.CODE_SECTION;
            }
        })
        ]
    }).addTo(map);
}