L.TileLayer.Yandex = L.TileLayer.Ecl.extend({
    initialize: function(mapType, /*Object*/ options) {
        this._mapType = mapType;
        L.Util.setOptions(this, options);
    },

    getTileUrl: function (xy, z) {
        var x = xy.x;
        var y = xy.y;

      switch (this._mapType)
      {
          case L.TileLayer.Yandex.SupportedTypes.Default:
              return "http://vec0"+((x+y)%5)+".maps.yandex.net/tiles?l=map&v=2.47.0&x=" + x + "&y=" + y + "&z=" + z;
          case L.TileLayer.Yandex.SupportedTypes.Hybrid:
              return "http://vec0"+((x+y)%5)+".maps.yandex.net/tiles?l=skl&v=2.47.0&x=" + x + "&y=" + y + "&z=" + z;
          case L.TileLayer.Yandex.SupportedTypes.Sattelite:
              return "http://sat0"+((x+y)%5)+".maps.yandex.net/tiles?l=sat&v=3.121.0&x=" + x + "&y=" + y + "&z=" + z;
          case L.TileLayer.Yandex.SupportedTypes.Trf:
              return "http://jgo.maps.yandex.net/1.1/tiles?l=trf&x=" + x + "&y=" + y + "&z=" + z + "&tm=" + Math.round(new Date().getTime()/1000);
      }
    }
});

L.TileLayer.Yandex.SupportedTypes = {
    Default : "Default",
    Hybrid : "Hybrid",
    Sattelite : "Sattelite",
    Trf: "Trf"
}