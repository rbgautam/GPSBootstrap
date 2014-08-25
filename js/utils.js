String.prototype.startWith = function (input) {
	return this.indexOf(input) == 0;
}

String.prototype.contains = function (input) {
	return this.indexOf(input) != -1;
}

String.prototype.getSmsValue = function () {
	var splitter = this.contains('=') ? '=' : ':';
	return this.split(splitter)[1];
}

Date.parseSms = function (input) {
	var parts = input.split(' ');
	if (parts.length != 3)
		return null;
	var isLtm = parts[0].toLowerCase() == 'ltm';
	var d = parts[1].split('-');
	var t = parts[2].split(':');

	var year, month, date, hours, minutes, seconds;
	year = isLtm ? d[0] : d[2];
	month = d[1] - 1;
	date = isLtm ? d[2] : d[0];

	hours = t[0];
	minutes = t[1];
	if (isLtm) seconds = t[2];

	return isLtm ?
	new Date('20' + year, month, date, hours, minutes, seconds) :
	new Date('20' + year, month, date, hours, minutes)
};

Date.prototype.toPrettyString = function (seconds) {
	var res = this.getHours().zeroPad(2) + ':' + this.getMinutes().zeroPad(2);
	if (seconds) res += ':' + this.getSeconds().zeroPad(2);
	res += ' ' + this.getDate().zeroPad(2) + '/' + (this.getMonth() + 1).zeroPad(2) + '/' + this.getFullYear();

	return res;
}

Number.prototype.truncate = function () {
	return this | 0;
}

Number.gpsToDec = function(gps) {
	var arr = gps.split(' ');
	var gpsDeg = Number(arr[0]);
	var gpsMin = Number(arr[1]);
	return (gpsDeg + gpsMin / 60).toFixed(10);
}

Number.prototype.zeroPad = function(length) {
	var str = this.toString();
	while (str.length < length)
		str = '0' + str;
	return str;
}

