function init_map() {
	var highlightStyle = {
		color: '#fff',
		opacity: 1,
	};

	var map = L.map('map');
	new L.OSM.CycleMap().addTo(map);
	var elevation = L.control.elevation({ width: 500 });
	elevation.addTo(map);

	var routesLayer = L.featureGroup().addTo(map);
	var routeCount = tracks.length;
	var loadedCount = 0;

	tracks.forEach(function(track) {
		$.get("tracks/" + track, function(data) {
			var route = new L.GPX(data, {
				async: true,
				marker_options: {},
				polyline_options: { distanceMarkers: { lazy: true } },
			});
			route.on('addline', function(evt) {
				var polyline = evt.line;
				var originalStyle = polyline.options;

				polyline.on('mouseover', function() {
					polyline.setStyle(highlightStyle)
					polyline.addDistanceMarkers();
				});
				polyline.on('mouseout', function() {
					polyline.setStyle(originalStyle)
					polyline.removeDistanceMarkers();
				});
				polyline.on('click', function() {
					elevation.clear();
					elevation.addData(polyline);
				});

				polyline.bindPopup(route.get_name());
			});
			route.on('loaded', function() {
				if (++loadedCount === routeCount) {
					map.fitBounds(routesLayer.getBounds());
				}
			});
			route.addTo(routesLayer);
		});
	});
}

// TODO
// labels instead of popups
// unique color for each track
// POIs
