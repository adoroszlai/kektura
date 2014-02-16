function init_map() {
	var map = L.map('map');
	new L.OSM.CycleMap().addTo(map);

	var routes = L.gpxGroup(tracks);
	routes.on('loaded', function() {
		map.fitBounds(routes.getBounds());
	});
	routes.addTo(map);
}

// TODO
// POIs
