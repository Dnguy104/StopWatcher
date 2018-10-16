function findLocation(location) {
	var output = document.getElementById('location');
	
	if (!navigator.geolocation){
    	output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
	    return;
	}
	
	function success(position) {
		var latitude  = position.coords.latitude;
    	var longitude = position.coords.longitude;
		
		location.innerHTML = 'lat: ' + latitude.toFixed(4) + '<br>' + 'long: ' + longitude.toFixed(4);
	}
	
	function error() {
	    location.innerHTML = 'lat: n/a' + '<br>' + 'long: n/a';
	}
	
	navigator.geolocation.getCurrentPosition(success, error);
}