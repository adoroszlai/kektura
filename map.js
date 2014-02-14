function init_map() {
	var highlightStyle = {
		color: '#fff',
		opacity: 1,
	};

	var map = L.map('map');
	new L.OSM.CycleMap().addTo(map);
	var elevation = L.control.elevation({ width: 500 });

	var routesLayer = L.featureGroup().addTo(map);
	var routeCount = tracks.length;
	var colors = unique_colors(routeCount);
	var count = 0;
	var loadedCount = 0;

	var markers = L.featureGroup().addTo(map);
	pois.forEach(function(poi) {
		var marker = L.marker(poi.latlng);
		marker.bindLabel(poi.name, { direction: 'auto' });
		marker.addTo(markers);
	});

	tracks.forEach(function(track) {
		$.get("tracks/" + track, function(data) {
			var route = new L.GPX(data, {
				async: true,
				marker_options: { startIconUrl: null, endIconUrl: null },
				polyline_options: {
					color: colors[count++],
					opacity: 0.75,
					distanceMarkers: { lazy: true },
				}
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
					if (!elevation.getContainer()) {
						elevation.addTo(map);
					}
					elevation.clear();
					elevation.addData(polyline);
				});

				polyline.bindLabel(route.get_name(), { direction: 'auto' });
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

function unique_colors(count) {
	if (count === 0) return [];
	if (count === 1) return ['#0000ff'];
	var increment = 1 / count;
	var colors = [];
	for (var i = 0; i < count; ++i) {
		var hue = i * increment;
		var rgb = hsvToRgb(hue, 1, 0.7);
		var hex = '#' + rgbToHex(rgb[0], rgb[1], rgb[2]);
		colors.push(hex);
	}
	return colors;
}

function rgbToHex(r, g, b) {
	return byteToHex(r) + byteToHex(g) + byteToHex(b);
}

function byteToHex(n) {
	return ((n >> 4) & 0x0F).toString(16) + (n & 0x0F).toString(16);
}

// TODO
// POIs
