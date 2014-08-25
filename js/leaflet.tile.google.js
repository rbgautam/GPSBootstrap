L.TileLayer.Google = L.TileLayer.extend({
  initialize: function(mapType, /*Object*/ options) {
    this._mapType = mapType;
    L.Util.setOptions(this, options);
  },
  
  getTileUrl: function (xy) {
    var x = xy.x;
    var y = xy.y;
    var z = xy.z;
    var index = (x * 3 + y) % 8;
    var salt = "Galileo".substr(0, index);

    switch (this._mapType)
    {
      case L.TileLayer.Google.SupportedTypes.Map:
      return "http://mt" + ((x+y)%2) + ".google.com/vt/lyrs=m@234000000&src=app&x=" + x + "&y=" + y + "&z=" + z + "&s=" + salt;
      case L.TileLayer.Google.SupportedTypes.Satellite:
      return "http://khm" + ((x+y)%2) + ".google.com/kh/v=138&x=" + x + "&y=" + y + "&z=" + z + "&s=" + salt;
      case L.TileLayer.Google.SupportedTypes.Hybrid:
      return "http://mt" + ((x+y)%2) + ".google.com/vt/lyrs=h@234000000&src=app&x=" + x + "&y=" + y + "&z=" + z + "&s=" + salt;
    }
  }
});

L.TileLayer.Google.SupportedTypes = {
  Map : "Map",
  Satellite : "Satellite",
  Hybrid : "Hybrid"
}