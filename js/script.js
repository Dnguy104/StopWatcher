var timer = document.getElementById('timer');
var toggleBtn = document.getElementById('toggle');
var timeTbl = document.getElementById('timeTbl');

var elem = {
	timer: timer,
	delay: 70
}
var watch = new Stopwatch(elem);

var timeList = {
	var times = [];
	
}

toggleBtn.addEventListener('click', function() {
	if (!watch.isOn) {
		var startTime = watch.start();
		
		handlers.start(startTime);
		toggleBtn.textContent = 'Finish!';
	}
	else {
		var endTime = watch.stop();

		handlers.stop(endTime);
		toggleBtn.textContent = 'Start!';
	}
});

var handlers = {
	
	start: function(time) {
		handlers.addRow();
		var newRow = timeTbl.lastChild.childNodes;
		
		newRow[0].innerHTML = time;
		newRow[1].innerHTML = 'Loading...'
		findLocation(newRow[1]);
	},
	
	stop: function(time) {
		var newRow = timeTbl.lastChild.childNodes;
		
		newRow[2].innerHTML = time['currentTime'];
		newRow[3].innerHTML = 'Loading...'
		findLocation(newRow[3]);
		newRow[4].innerHTML = time['stopwatchTime'];
	},
	
	addRow: function() {
		var entry = document.createElement('tr');
		for(let i = 0; i < 5; i++) {
			var data = document.createElement('td');
			data.innerHTML = '<br><br>';
			entry.appendChild(data);
		}
		
		timeTbl.appendChild(entry);
	}
};


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


