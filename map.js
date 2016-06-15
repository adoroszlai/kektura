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

	$.get('tracks/okt.gpx', function (data) {
		new L.GPX(data, {
			async: true,
			polyline_options: {
				color: 'blue',
				opacity: 0.33,
				distanceMarkers: { lazy: true },
			}
		}).on('loaded', function(e) {
			map.fitBounds(e.target.getBounds());
		}).addTo(map);
		L.gpxGroup(tracks).on('loaded', function(e) {
			var pct = Math.round(e.target.get_distance() / 1160.0) / 10;
			map.attributionControl.setPrefix('kéktúra:' + pct + '%');
		}).addTo(map);
	});
}
