initmap();

function initmap() {
    // Feature service url
    const url = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_Overlays/FeatureServer/0'
    
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
        return L.Util.template(`<p><b>Overlay Name</b>: {OVERLAY_NAME}</p>
                                <p><b>Overlay Symbol</b>: {OVERLAY_SYMBOL}</p>
                                <p><b>Type</b>: {TYPE}</p>
                                <p><b>Code Section</b>: <a href={CODE_SECTION_LINK}>{CODE_SECTION}</a></p>
                                <p><b>Sunset Date</b>: {SUNSET_DATE}</p>
                                <p><b>Pending</b>: {PENDING}</p>
                                <p><b>Pending Bill</b>: <a href={PENDINGBILLURL}>{PENDINGBILL}</a></p>`, 
                                layer.feature.properties);
    });
}