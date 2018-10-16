var timer = document.getElementById('timer');
var toggleBtn = document.getElementById('toggle');

var timeList = {
	times: [],
	addRow: function(start){
		this.times.push({
			startTime: '',
			startLocation: '',
			stopTime: '',
			stopLocation: '',
			elapsedTime: '',
			isComplete: false
		});
	},
	addData: function(index, key, value) {
		this.times[index][key] = value;
	},
	complete: function(index) {
		this.times[index].isComplete = true;
	}
	
}

var views = {
	initializeList: function() {
		var localS  = localStorage.getItem('times');
		if(localS) {
			 timeList.times = JSON.parse(localStorage.getItem('times'));
		}
		localStorage.setItem('times',JSON.stringify(timeList.times));
		this.recoverData();
		this.displayTimes();
	},
	displayTimes: function() {
		var timeTbl = document.getElementById('timeTbl');
		localStorage.setItem('times',JSON.stringify(timeList.times));
		
		timeTbl.innerHTML = `<tr>
								<th>Start Time</th>
								<th>Start Location</th>
								<th>Finished Time</th>
								<th>Finish Location</th>
								<th>Elapsed Time</th>
							</tr>`;
		timeList.times.forEach(function(elem1) {
			var entry = document.createElement('tr');
			for (var prop in elem1) {
			    if (elem1.hasOwnProperty(prop) && prop != 'isComplete') {
					var data = document.createElement('td');
					data.innerHTML = elem1[prop];
					entry.appendChild(data);
					timeTbl.appendChild(entry);
				}
			}
				
		});
	},
	recoverData: function() {
		for (let index = 0; index < timeList.times.length; index++) {
			var elem = timeList.times[index];
			
		    if (elem.isComplete == false) {
		    	if (elem.stopTime == '') {
					var startTime = watch.start(new Date(elem['startTime']));
					if (elem.startLocation == 'Loading...') findLocation(index, 'startLocation');
					toggleBtn.textContent = 'Finish';
					return;
				}
				if (elem.startLocation == 'Loading...') findLocation(index, 'startLocation');
				if (elem.stopLocation == 'Loading...') findLocation(index, 'stopLocation');				
			}		
		}
	},
	initializeBtn: function() {
		toggleBtn.addEventListener('click', function() {
			if (!watch.isOn) {
				var startTime = watch.start(new Date);
				
				handlers.start(startTime);
				toggleBtn.textContent = 'Finish!';
			}
			else {
				var endTime = watch.stop();

				handlers.stop(endTime);
				toggleBtn.textContent = 'Start!';
			}
		});		
	}
}

var handlers = {
	start: function(time) {
		timeList.addRow(time);
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'startTime', time);
		timeList.addData(newIndex, 'startLocation', 'Loading...');
		findLocation(newIndex, 'startLocation');
		
		views.displayTimes();
	},
	stop: function(time) {		
		var newIndex = timeList.times.length - 1;
		timeList.addData(newIndex, 'stopTime', time['currentTime']);
		timeList.addData(newIndex, 'stopLocation', 'Loading...');
		timeList.addData(newIndex, 'elapsedTime', time['stopwatchTime']);
		findLocation(newIndex, 'stopLocation');
		
		views.displayTimes();
	}
	
};

function findLocation(index, key) {
	var output = document.getElementById('location');
	
	if (!navigator.geolocation){
    	output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
	    return;
	}
	
	function success(position) {
		var latitude  = position.coords.latitude;
    	var longitude = position.coords.longitude;
    	
		timeList.addData(index, key, 'lat: ' + latitude.toFixed(4) + '<br>' + 'long: ' + longitude.toFixed(4));
		if (key == 'stopLocation') timeList.complete(index);
		views.displayTimes();
	}
	
	function error() {
	    timeList.addData(index, key, 'lat: n/a' + '<br>' + 'long: n/a');
	    if (key == 'stopLocation') timeList.complete(index);
	    views.displayTimes();
	}
	
	navigator.geolocation.getCurrentPosition(success, error);
}

var elem = {
	timer: timer,
	delay: 70
}
var watch = new Stopwatch(elem);

views.initializeList();
views.initializeBtn();

