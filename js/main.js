Navi = {
	
	Layers : {
		OSM : null,
		Yandex : null,
		Google : null,
		Bing: null
	},

	initializeMap: function () {
		map = new L.Map('map', { zoomControl:false });
		map.setView(startPoint, startZoom);
		var tileUrlOSM = 'http://{s}.tile.cloudmade.com/' + cloudmadeKey + '/997/256/{z}/{x}/{y}.png';
		Navi.Layers.OSM = new L.TileLayer(tileUrlOSM, {
			maxZoom: 18,
			attribution: 'Данные карты &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
		});
		

		Navi.Layers.Yandex = new L.TileLayer.Yandex(L.TileLayer.Yandex.SupportedTypes.Default, {
			attribution: 'Данные карты &copy; <a href="http://yandex.ru">Яндекс</a></a>'
		});

		Navi.Layers.Google = new L.TileLayer.Google(L.TileLayer.Google.SupportedTypes.Map, {
			attribution: 'Данные карты &copy; <a href="http://google.com">Google</a>'
		});

		Navi.Layers.Bing = new L.TileLayer.Bing(bingKey, "Road", {
			attribution: 'Данные карты &copy; <a href="http://microsoft.com">Microsoft Corporation</a>'
		});
		
		map.addLayer(this.Layers.OSM);

		new L.Control.Zoom({ position: 'topright' }).addTo(map);
	},

	switchLayer: function (link) {
		var layer = eval(link.getAttribute('layer'));
		if (map.hasLayer(layer)) { return; }

		if (map.hasLayer(this.Layers.OSM)) { map.removeLayer(this.Layers.OSM); }
		if (map.hasLayer(this.Layers.Yandex)) { map.removeLayer(this.Layers.Yandex); }
		if (map.hasLayer(this.Layers.Google)) { map.removeLayer(this.Layers.Google); }
		if (map.hasLayer(this.Layers.Bing)) { map.removeLayer(this.Layers.Bing); }
		
		map.addLayer(layer);
	},

	parseSms: function (text) {


		var err = { Error: null };

		

		var res = {
			Name: null,
			Time: null,
			MCC: null,
			MNC: null,
			Cells: [],
			LAC: [],
			CID: [],
			Signal: [],
			GsmSignal: null,
			Latitude: null,
			Longitude: null,
			Speed: null,
			Direction: null,
			Temperature: null,
			Battery: null,
			Power: null,
			Mode: null
		};

		
		//Splitting the SMS into array	
		var lines = text.split('\n');
		if (text.length < 10) {
			err.Error = 'Сообщение не может быть короче 10 строк';
			return err;
		}

		
		//Device name 
		res.Name = lines[0];

		//time: GMT or LTM 
		var time = lines[1].toLowerCase();
		var isLtm = time.startWith('ltm');

		alert( isLTM);

		if (!isLtm && !time.startWith('gmt')) {
			err.Error = 'Вторая строка сообщения должна содержать время и начинаться с LTM или GMT';
			return err;
		}
		
		
		//formatting the time string
		res.Time = Date.parseSms(time).toPrettyString(isLtm);
		if (!isLtm){
			var gmt = time.split(' ')[0].substr(3);
			if (!gmt.startWith('-'))
				gmt = '+' + gmt;
			res.Time += ' GMT' + gmt;
		}

		// alert('time' + this.Time);

		var lacCount = 0;



		// running a loop to parse the sms text after line[1]
		for (var i = 2; i < lines.length; i++) {
			var line = lines[i].toLowerCase();

			//Verifying if GPS data is present
			var isGps = line.contains('.') && !line.contains('=') && !line.contains(':') &&
				(line.startWith('n') || line.startWith('s') || line.startWith('e') || line.startWith('w'));
			// if GPS data is present in LON LAT format	
			if (isGps) {
				var sign = line.startWith('n') || line.startWith('e') ? 1 : -1;
				var value = line.substr(1);
				var deg = line.contains(' ');
				if (line.startWith('n') || line.startWith('s')) {
					res.Latitude = deg ? Number.gpsToDec(value) : value;
				}
				else if (line.startWith('e') || line.startWith('w')) {
					res.Longitude = deg ? Number.gpsToDec(value) : value;
				}
			}// else see if a url is present for the GPS data
			else if (line.startWith('http://')) {
				var arr = line.split('?')[1].split('&');
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].startWith('pt=')) {
						var pt = arr[i].split('=')[1].split(',');
						res.Latitude = pt[1];
						res.Longitude = pt[0];
						break;
					}
				}
			}
			else if (line.startWith('gps')) { /* TODO: WTF is GPS? */ }
			else if (line.startWith('mcc')) { res.MCC = line.getSmsValue(); }
			else if (line.startWith('mnc')) { res.MNC = line.getSmsValue(); }
			else if (line.startWith('lac')) {  
				//handling multiline or single line lacs and cid
				if(line.search('cid') != -1){
					//split in array and add values
					var lacVal = line.split(',');
					// console.log(lacVal.length);
					res.LAC[lacCount] = lacVal[0].getSmsValue();
					res.CID[lacCount] = lacVal[1].getSmsValue();
					res.Signal[lacCount] = lacVal[2];
					// console.log(res.LAC[lacCount]+','+ res.CID[lacCount] +','+ res.Signal[lacCount]);	
					console.log(lacCount);
					lacCount++;
				}else{
					res.LAC[0] = line.getSmsValue();
				}	

			}
			else if (line.startWith('cid')) { res.CID[0] = line.getSmsValue(); } // if cid present in a diffent line
			else if (line.startWith('gsm')) { res.GsmSignal = line.getSmsValue().replace('dbm','дБм').replace('db','дБм'); }
			else if (line.contains('km/h') && (line.startWith('spd') || line.startWith('v'))) { // get the speed
				var speed = line.getSmsValue().split(' ');
				res.Speed = speed[0].replace('km/h', 'км/ч');
				res.Direction = speed[1];
			}
			else if (line.startWith('t')) { res.Temperature = line.getSmsValue().replace('c', '°C'); }
			else if (line.startWith('bat')) {
				var battery = line.getSmsValue().split('-');
				res.Battery = battery[0].replace('v', 'В') + ' (' + battery[1] + ')';
			}
			else if (line.startWith('ex_batt')) { res.Power = line.getSmsValue().replace('v', 'В') }
			else if (line.startWith('m')) { res.Mode = line.getSmsValue() }
			else if (line.startWith('fid')) { /* TODO: WTF is FID? */ }

			if (res.Latitude && res.Longitude) {
				if (res.Latitude > 90 || res.Latitude < -90 || res.Longitude > 180 || res.Longitude < -180) {
					err.Error = 'Долгота и широта должны быть в диапазоне -90...+90 и -180...+180 соответсвенно. Возможно вы забыли указать пробел, например, указали N434.5977 вместо N43 4.5977';
					return err;
				}
			}
		}
		return res;
	},
	parseGps: function (latitude, longitude) {

	}




}

Navi.initializeMap();
	// Load this script when page loads
	$(document).ready(function(){
	  
		// Set up a listener so that when anything with a class of 'tab' 
		// is clicked, this function is run.
		$('.tab').click(function () {

			// Remove the 'active' class from the active tab.
			$('#tabs_container > .tabs > li.active')
			  .removeClass('active');
			  
			// Add the 'active' class to the clicked tab.
			$(this).parent().addClass('active');

			// Remove the 'tab_contents_active' class from the visible tab contents.
			$('#tabs_container > .tab_contents_container > div.tab_contents_active')
			  .removeClass('tab_contents_active');

			// Add the 'tab_contents_active' class to the associated tab contents.
			$(this.rel).addClass('tab_contents_active');

		});
	});



