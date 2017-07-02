L.GPX.include(L.Mixin.Selectable);

L.GpxGroup = L.Class.extend({
	options: {
		highlight: {
			color: '#fff',
			opacity: 1,
		},
	},

	initialize: function (routes, options) {
		this._routes = routes;
		this._layers = L.featureGroup();
		this._elevation = L.control.elevation({ width: 500 });
		this._distance = 0;
		L.Util.setOptions(this, options);
	},

	getBounds: function() {
		return this._layers.getBounds();
	},

	addTo: function (map) {
		this._layers.addTo(map);

		var this_ = this;
		var elevation_ = this._elevation;

		var routeCount = this._routes.length;
		var colors = this.options.colors || ColorUtils.uniqueColors(routeCount);
		var count = 0;
		var loadedCount = 0;

		this.on('selectionChanged', function() {
			var route = this_.getSelection();
			if (route && route.isSelected()) {
				if (!elevation_.getContainer()) {
					elevation_.addTo(map);
				}
				elevation_.clear();
				route.getLayers().forEach(function(layer) {
					if (layer instanceof L.Polyline) {
						elevation_.addData(layer);
					}
				});
			} else {
				if (elevation_.getContainer()) {
					elevation_.removeFrom(map);
				}
				elevation_.clear();
			}
		});

		this._routes.forEach(function(track) {
			$.get(track, function(data) {
				var route = new L.GPX(data, {
					async: true,
					marker_options: { startIconUrl: null, endIconUrl: null },
					polyline_options: {
						color: colors[count++ % colors.length],
						opacity: 0.75,
						distanceMarkers: { lazy: true },
					}
				});
				route.on('addline', function(evt) {
					var polyline = evt.line;
					var originalStyle = polyline.options;

					var highlight = function() {
						polyline.setStyle(this_.options.highlight)
						polyline.addDistanceMarkers();
					};
					var unhighlight = function() {
						polyline.setStyle(originalStyle)
						polyline.removeDistanceMarkers();
					};
					polyline.on('mouseover', function() {
						if (!route.isSelected()) {
							highlight();
						}
					});
					polyline.on('mouseout', function() {
						if (!route.isSelected()) {
							unhighlight();
						}
					});
					polyline.on('click', function() {
						this_.setSelection(route);
					});
					route.on('selected', function() {
						if (!route.isSelected()) {
							unhighlight();
						}
					});

					polyline.bindLabel(route.get_name(), { direction: 'auto' });
				});
				route.on('loaded', function() {
					this_._distance += route.get_distance();
					if (++loadedCount === routeCount) {
						this_.fire('loaded');
					}
				});
				route.addTo(this_._layers);
			});
		});
	},

	removeFrom: function (map) {
		this._layers.removeFrom(map);
	},

	get_distance: function() {
		return this._distance;
	},

});
L.GpxGroup.include(L.Mixin.Events);
L.GpxGroup.include(L.Mixin.Selection);

L.gpxGroup = function(routes, options) {
	return new L.GpxGroup(routes, options);
};
