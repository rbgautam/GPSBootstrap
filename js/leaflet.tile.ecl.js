L.TileLayer.Ecl = L.TileLayer.extend({
    _loadTile: function (tile, tilePoint) {
        var zoom = this._map.getZoom();
        var atanh = function (x) {
            return 0.5 * Math.log((1 + x) / (1 - x));
        },

        fromLatLngToPixel = function (latlng, zoom) {
            var PixelsAtZoom = 256 * Math.pow(2, zoom);
            var exct = 0.0818197;
            var z = Math.sin(latlng.lat * L.LatLng.DEG_TO_RAD);
            var c = (PixelsAtZoom / (2 * Math.PI));
            var x = PixelsAtZoom / 2 + latlng.lat * (PixelsAtZoom / 360);
            var y = PixelsAtZoom / 2 - c * (atanh(z) - exct * atanh(exct * z));
            return new L.Point(x, y);
        };
        var x = tilePoint.x;
        var y = tilePoint.y;
        var lat = this._map.unproject(tilePoint.multiplyBy(256), zoom);
        y = fromLatLngToPixel(new L.LatLng(lat.lat, lat.lng), zoom).divideBy(256).y;
        var absY = Math.floor(y);
        $(tile).css("margin-top", ((absY - y) * 256) + "px");
        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;
        tile.src = this.getTileUrl(new L.Point(x, absY), zoom);
    },

    _update: function (e) {
        if (this._map._panTransition && this._map._panTransition._inProgress) { return; }

        var bounds = this._map.getPixelBounds(),
		    zoom = this._map.getZoom(),
		    tileSize = this.options.tileSize;

        bounds = new L.Bounds(bounds.min, new L.Point(bounds.max.x, bounds.max.y + 256));

        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }

        var nwTilePoint = new L.Point(
				Math.floor(bounds.min.x / tileSize),
				Math.floor(bounds.min.y / tileSize)),
			seTilePoint = new L.Point(
				Math.floor(bounds.max.x / tileSize),
				Math.floor(bounds.max.y / tileSize)),
			tileBounds = new L.Bounds(nwTilePoint, seTilePoint);

        this._addTilesFromCenterOut(tileBounds);

        if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
            this._removeOtherTiles(tileBounds);
        }
    }
});