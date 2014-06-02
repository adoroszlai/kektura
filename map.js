function init_map() {
	var map = L.map('map');
	new L.OSM.CycleMap().addTo(map);
	L.control.scale().addTo(map);

	var markers = L.featureGroup().addTo(map);
	pois.forEach(function(poi) {
		var marker = L.marker(poi.latlng);
		marker.bindLabel(poi.name, { direction: 'auto' });
		marker.addTo(markers);
	});

	var routes = L.gpxGroup(tracks);
	routes.on('loaded', function() {
		map.fitBounds(routes.getBounds());
	});
	routes.addTo(map);
}
